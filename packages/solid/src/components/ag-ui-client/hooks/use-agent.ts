/* eslint-disable solid/reactivity -- AG-UI requires identity-preserving mutable state. */
import { onCleanup, onMount, type Accessor } from "solid-js";
import { createMutable } from "solid-js/store";
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

export interface UseAgentOptions {
  url: string;
  tools?: ToolRegistry | Accessor<ToolRegistry | undefined>;
  context?: AgentContext[];
  headers?: Record<string, string>;
  initialMessages?: Message[];
  agentFactory?: (options: {
    url: string;
    headers?: Record<string, string>;
  }) => AbstractAgent;
}

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
  const state = createMutable<AgentState>({
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

  const executeRun = async (withContext: boolean) => {
    if (!agent) return;
    state.error = null;
    try {
      await agent.runAgent({
        tools: getToolDefinitions(getTools()),
        ...(withContext && {
          context: state.context?.map(({ value, description }) => ({
            value,
            description,
          })),
        }),
      });
    } catch {
      state.isRunning = false;
      if (state.status === "running") state.status = "error";
    }
  };

  onMount(() => {
    const factory = options.agentFactory ?? ((value) => new HttpAgent(value));
    agent = factory({ url: options.url, headers: options.headers });
    agent.messages = [...(options.initialMessages ?? [])];
    const subscription = agent.subscribe(
      createAgentSubscriber({
        state,
        getTools,
        onNeedsReRun: async (pending) => {
          if (!agent) return;
          agent.messages.push(...pending);
          await executeRun(false);
        },
        onIdle: async () => {
          if (!agent || state.status !== "success") return;
          const next = state.queue.shift();
          if (!next) return;
          const userMessage: UserMessage = {
            id: next.id,
            role: "user",
            content: next.content.map((item) => ({ ...item }) as InputContent),
          };
          agent.messages.push(userMessage);
          state.messages.push(userMessage);
          await executeRun(true);
        },
      }),
    );
    onCleanup(() => {
      subscription.unsubscribe();
      agent = undefined;
    });
  });

  const send = async (content: InputContent[]) => {
    if (!agent) return;
    if (state.isRunning) {
      state.queue.push({ id: v7(), content });
      return;
    }
    const userMessage: UserMessage = { id: v7(), role: "user", content };
    agent.messages.push(userMessage);
    state.messages.push(userMessage);
    await executeRun(true);
  };

  const retry = async () => {
    if (!agent) return;
    const lastUserMessageIndex = state.messages.findLastIndex(
      (message) => message.role === "user",
    );
    if (lastUserMessageIndex === -1) return;
    const messages = agent.messages.slice(0, lastUserMessageIndex + 1);
    agent.messages = [...messages];
    state.messages = [...messages];
    await executeRun(true);
  };

  return {
    state,
    send,
    retry,
    abort: () => {
      if (!agent) return;
      if (state.queue.length > 0) {
        state.queue.pop();
        return;
      }
      agent.abortRun();
      state.status = "aborted";
      state.isRunning = false;
      state.activity = "idle";
    },
    dequeue: (id) => {
      const index = state.queue.findIndex((queued) => queued.id === id);
      if (index !== -1) state.queue.splice(index, 1);
    },
    addTool: (name, tool) => {
      if (!dynamicTools) staticTools = { ...(staticTools ?? {}), [name]: tool };
    },
    setContext: (context) => {
      state.context = context;
    },
    setPromptTemplates: (templates) => {
      state.promptTemplates = normalizePromptTemplates(templates);
    },
  };
}
