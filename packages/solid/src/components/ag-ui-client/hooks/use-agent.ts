import { createStore, onSettled, type Accessor } from "solid-js";
import {
  type AbstractAgent,
  HttpAgent,
  type InputContent,
  type Message,
  type UserMessage,
} from "@ag-ui/client";
import type { Interrupt } from "@ag-ui/core";
import { v7 } from "uuid";

import {
  createAgentSubscriber,
  type AgentActivity,
  type AgentRunStatus,
} from "../internal/create-agent-subscriber";
import { normalizePromptTemplates } from "../internal/normalize-prompt-templates";
import {
  getToolDefinitions,
  type AnyToolDef,
  type ToolRegistry,
} from "../internal/tool-registry";

export interface AgentContext {
  value: string;
  description: string;
}

interface SharedUseAgentOptions {
  tools?: ToolRegistry | Accessor<ToolRegistry | undefined>;
  context?: AgentContext[];
  initialMessages?: Message[];
}

export type UseAgentOptions = SharedUseAgentOptions &
  (
    | {
        url: string;
        headers?: Record<string, string>;
        agentFactory?: (options: {
          url: string;
          headers?: Record<string, string>;
        }) => AbstractAgent;
      }
    | {
        url?: never;
        headers?: never;
        agentFactory: () => AbstractAgent;
      }
  );

export interface QueuedMessage {
  id: string;
  content: InputContent[];
}

export interface AgentState {
  error: string | null;
  messages: Message[];
  context?: AgentContext[];
  isRunning: boolean;
  status: AgentRunStatus;
  activity: AgentActivity;
  pendingInterrupts: Interrupt[];
  promptTemplates: Array<{
    description: string;
    content: InputContent[];
  }>;
  queue: QueuedMessage[];
}

export interface UseAgentReturn {
  state: AgentState;
  send: (content: InputContent[]) => Promise<void>;
  retry: () => Promise<void>;
  abort: () => void;
  dequeue: (id: string) => void;
  addTool: (name: string, tool: AnyToolDef) => void;
  setContext: (context: AgentContext[]) => void;
  setPromptTemplates: (
    templates: Array<{
      description: string;
      content: string | InputContent[];
    }>,
  ) => void;
}

export function useAgent(options: UseAgentOptions): UseAgentReturn {
  const dynamicTools =
    typeof options.tools === "function" ? options.tools : undefined;
  let staticTools: ToolRegistry | undefined =
    typeof options.tools === "function" ? undefined : options.tools;
  let agent: AbstractAgent | undefined;
  const [state, setState] = createStore<AgentState>({
    error: null,
    messages: [...(options.initialMessages ?? [])],
    context: options.context,
    isRunning: false,
    status: "idle",
    activity: "idle",
    pendingInterrupts: [],
    promptTemplates: [],
    queue: [],
  });
  const getTools = () => dynamicTools?.() ?? staticTools ?? {};

  const executeRun = async () => {
    if (!agent) {
      return;
    }
    let context: AgentContext[] | undefined;
    setState((draft) => {
      draft.error = null;
      // Stateless backends reconstruct each run. Read the draft so a context
      // update immediately followed by send() reaches the transport too.
      context = draft.context?.map(({ value, description }) => ({
        value,
        description,
      }));
    });
    try {
      await agent.runAgent({ tools: getToolDefinitions(getTools()), context });
    } catch {
      setState((draft) => {
        draft.isRunning = false;
        if (draft.status === "running") {
          draft.status = "error";
        }
      });
    }
  };

  onSettled(() => {
    agent =
      options.url === undefined
        ? options.agentFactory()
        : (options.agentFactory ?? ((value) => new HttpAgent(value)))({
            url: options.url,
            headers: options.headers,
          });
    agent.messages = [...(options.initialMessages ?? [])];
    const mountedAgent = agent;
    const subscription = mountedAgent.subscribe(
      createAgentSubscriber({
        setState,
        getTools,
        onNeedsReRun: async (pending) => {
          if (!agent) {
            return;
          }
          agent.messages.push(...pending);
          await executeRun();
        },
        onIdle: async () => {
          if (!agent) {
            return;
          }
          let userMessage: UserMessage | undefined;
          setState((draft) => {
            if (draft.status !== "success") {
              return;
            }
            const next = draft.queue.shift();
            if (next) {
              userMessage = {
                id: next.id,
                role: "user",
                content: next.content.map((item) => ({ ...item })),
              };
              draft.messages.push(userMessage);
            }
          });
          if (!userMessage) {
            return;
          }
          agent.messages.push(userMessage);
          await executeRun();
        },
      }),
    );
    return () => {
      mountedAgent.abortRun();
      subscription.unsubscribe();
      if (agent === mountedAgent) {
        agent = undefined;
      }
    };
  });

  const send = async (content: InputContent[]) => {
    if (!agent) {
      return;
    }
    const userMessage: UserMessage = { id: v7(), role: "user", content };
    let queued = false;
    setState((draft) => {
      if (draft.isRunning) {
        draft.queue.push({ id: userMessage.id, content });
        queued = true;
      } else {
        draft.messages.push(userMessage);
      }
    });
    if (queued) {
      return;
    }
    agent.messages.push(userMessage);
    await executeRun();
  };

  const retry = async () => {
    if (!agent) {
      return;
    }
    const lastUserMessageIndex = agent.messages.findLastIndex(
      (message) => message.role === "user",
    );
    if (lastUserMessageIndex === -1) {
      return;
    }
    const messages = agent.messages.slice(0, lastUserMessageIndex + 1);
    agent.messages = [...messages];
    setState((draft) => {
      draft.messages = [...messages];
    });
    await executeRun();
  };

  return {
    state,
    send,
    retry,
    abort: () => {
      if (!agent) {
        return;
      }
      let abortedRun = false;
      setState((draft) => {
        if (draft.queue.length > 0) {
          draft.queue.pop();
          return;
        }
        abortedRun = true;
        draft.status = "aborted";
        draft.isRunning = false;
        draft.activity = "idle";
      });
      if (abortedRun) {
        agent.abortRun();
      }
    },
    dequeue: (id) => {
      setState((draft) => {
        const index = draft.queue.findIndex((queued) => queued.id === id);
        if (index !== -1) {
          draft.queue.splice(index, 1);
        }
      });
    },
    addTool: (name, tool) => {
      if (!dynamicTools) {
        staticTools = { ...(staticTools ?? {}), [name]: tool };
      }
    },
    setContext: (context) => {
      setState((draft) => {
        draft.context = context;
      });
    },
    setPromptTemplates: (templates) => {
      setState((draft) => {
        draft.promptTemplates = normalizePromptTemplates(templates);
      });
    },
  };
}
