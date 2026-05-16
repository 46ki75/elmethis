import {
  $,
  noSerialize,
  useSignal,
  useStore,
  useVisibleTask$,
  type NoSerialize,
} from "@qwik.dev/core";

import {
  type AbstractAgent,
  type BaseEvent,
  HttpAgent,
  type InputContent,
  type Message,
  type UserMessage,
} from "@ag-ui/client";
import { v7 } from "uuid";

import {
  type AnyToolDef,
  type ToolRegistry,
  getToolDefinitions,
} from "./tool-registry";
import { createAgentSubscriber } from "./create-agent-subscriber";
import { normalizePromptTemplates } from "./normalize-prompt-templates";

export interface UseAgentOptions {
  url: string;
  tools?: ToolRegistry;
  context?: { value: string; description: string }[];
  headers?: Record<string, string>;
  initialMessages?: Message[];
  /**
   * Inject an alternate transport. Primarily for tests. Defaults to
   * `(opts) => new HttpAgent(opts)`.
   */
  agentFactory?: (opts: {
    url: string;
    headers?: Record<string, string>;
  }) => AbstractAgent;
}

export interface AgentState {
  error: string | null;
  messages: Message[];
  events: BaseEvent[];
  context?: { value: string; description: string }[];
  isRunning: boolean;
  promptTemplates: { description: string; content: InputContent[] }[];
}

export function useAgent({
  url,
  tools,
  context,
  headers,
  initialMessages,
  agentFactory,
}: UseAgentOptions) {
  const agentRef = useSignal<NoSerialize<AbstractAgent> | null>(null);
  const toolsRef = useSignal<NoSerialize<ToolRegistry>>(noSerialize(tools));
  const factoryRef = useSignal<
    NoSerialize<NonNullable<UseAgentOptions["agentFactory"]>>
  >(noSerialize(agentFactory));

  const state = useStore<AgentState>({
    error: null,
    messages: initialMessages ?? [],
    events: [],
    context,
    isRunning: false,
    promptTemplates: [],
  });

  const executeRun = $(async (withContext: boolean) => {
    if (!agentRef.value) return;
    state.error = null;
    try {
      await agentRef.value.runAgent({
        tools: getToolDefinitions(toolsRef.value ?? {}),
        ...(withContext && {
          context: state.context?.map(({ value, description }) => ({
            value,
            description,
          })),
        }),
      });
    } catch {
      state.isRunning = false;
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup, track }) => {
      const trackedUrl = track(() => url);
      const trackedHeaders = track(() =>
        headers ? { ...headers } : undefined,
      );

      const factory =
        factoryRef.value ?? ((opts) => new HttpAgent(opts));
      agentRef.value = noSerialize(
        factory({ url: trackedUrl, headers: trackedHeaders }),
      );
      cleanup(() => {
        agentRef.value = null;
      });

      const agent = agentRef.value;
      if (!agent) return;

      const subscription = agent.subscribe(
        createAgentSubscriber({
          state,
          getTools: () => toolsRef.value ?? {},
          onNeedsReRun: async (pending) => {
            if (!agentRef.value) return;
            agentRef.value.messages.push(...pending);
            await executeRun(false);
          },
        }),
      );

      cleanup(() => {
        subscription.unsubscribe();
      });
    },
    { strategy: "document-ready" },
  );

  const send = $(async (content: InputContent[]) => {
    if (!agentRef.value) return;
    const userMessage: UserMessage = {
      id: v7(),
      role: "user",
      content,
    };
    agentRef.value.messages.push(userMessage);
    state.messages.push(userMessage);
    await executeRun(true);
  });

  const retry = $(async () => {
    if (!agentRef.value) return;

    const lastUserMessageIndex = state.messages.findLastIndex(
      (m) => m.role === "user",
    );
    if (lastUserMessageIndex === -1) return;

    const newMessages = agentRef.value.messages.slice(
      0,
      lastUserMessageIndex + 1,
    );
    agentRef.value.messages = [...newMessages];
    state.messages = [...newMessages];
    await executeRun(true);
  });

  const addTool = $((name: string, tool: AnyToolDef) => {
    toolsRef.value = noSerialize({ ...(toolsRef.value ?? {}), [name]: tool });
  });

  const abort = $(() => {
    agentRef.value?.abortRun();
  });

  const setContext = $(
    (newContext: { value: string; description: string }[]) => {
      state.context = newContext;
    },
  );

  const setPromptTemplates = $(
    (
      templates: { description: string; content: string | InputContent[] }[],
    ) => {
      state.promptTemplates = normalizePromptTemplates(templates);
    },
  );

  return {
    state,
    send$: send,
    retry$: retry,
    abort$: abort,
    addTool$: addTool,
    setContext$: setContext,
    setPromptTemplates$: setPromptTemplates,
  };
}
