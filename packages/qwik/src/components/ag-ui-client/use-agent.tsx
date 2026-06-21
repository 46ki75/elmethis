import {
  $,
  isSignal,
  noSerialize,
  useSignal,
  useStore,
  useVisibleTask$,
  type NoSerialize,
  type Signal,
} from "@qwik.dev/core";

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
  type AnyToolDef,
  type ToolRegistry,
  getToolDefinitions,
} from "./tool-registry";
import {
  createAgentSubscriber,
  type AgentActivity,
  type AgentRunStatus,
} from "./create-agent-subscriber";
import { normalizePromptTemplates } from "./normalize-prompt-templates";

export interface UseAgentOptions {
  url: string;
  /**
   * Frontend-executed tools the agent may call.
   *
   * - Plain `ToolRegistry`: static set. Mutate via the returned
   *   `addTool$` to add entries at runtime.
   * - `Signal<NoSerialize<ToolRegistry> | undefined>`: dynamic set
   *   owned by the caller (e.g., `useMcpTools`). `useAgent` re-reads
   *   the signal at every `runAgent` call. `addTool$` becomes a no-op
   *   in this mode — mutate the signal's source instead.
   */
  tools?: ToolRegistry | Signal<NoSerialize<ToolRegistry> | undefined>;
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
  context?: { value: string; description: string }[];
  isRunning: boolean;
  /** Coarse run lifecycle — see {@link AgentRunStatus}. */
  status: AgentRunStatus;
  /** Live in-run activity hint — see {@link AgentActivity}. */
  activity: AgentActivity;
  /** Unresolved interrupts from the last run (human-in-the-loop). */
  pendingInterrupts: Interrupt[];
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
  const toolsSignal = isSignal(tools)
    ? (tools as Signal<NoSerialize<ToolRegistry> | undefined>)
    : undefined;
  const toolsRef = useSignal<NoSerialize<ToolRegistry>>(
    noSerialize(toolsSignal ? undefined : (tools as ToolRegistry | undefined)),
  );
  const factoryRef = useSignal<
    NoSerialize<NonNullable<UseAgentOptions["agentFactory"]>>
  >(noSerialize(agentFactory));

  const state = useStore<AgentState>({
    error: null,
    messages: initialMessages ?? [],
    context,
    isRunning: false,
    status: "idle",
    activity: "idle",
    pendingInterrupts: [],
    promptTemplates: [],
  });

  const executeRun = $(async (withContext: boolean) => {
    if (!agentRef.value) return;
    state.error = null;
    const registry = toolsSignal
      ? (toolsSignal.value ?? {})
      : (toolsRef.value ?? {});
    try {
      await agentRef.value.runAgent({
        tools: getToolDefinitions(registry),
        ...(withContext && {
          context: state.context?.map(({ value, description }) => ({
            value,
            description,
          })),
        }),
      });
    } catch {
      state.isRunning = false;
      // The lifecycle hooks own `error`/`aborted`; only fall back to a generic
      // error status if the throw bypassed them while a run was still live.
      if (state.status === "running") state.status = "error";
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup, track }) => {
      const trackedUrl = track(() => url);
      const trackedHeaders = track(() =>
        headers ? { ...headers } : undefined,
      );

      const factory = factoryRef.value ?? ((opts) => new HttpAgent(opts));
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
          getTools: () =>
            (toolsSignal ? toolsSignal.value : toolsRef.value) ?? {},
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
    // Signal-backed tools are owned by the caller; mutating toolsRef
    // here would be silently dropped on the next runAgent read.
    if (toolsSignal) return;
    toolsRef.value = noSerialize({ ...(toolsRef.value ?? {}), [name]: tool });
  });

  const abort = $(() => {
    if (!agentRef.value) return;
    agentRef.value.abortRun();
    state.status = "aborted";
    state.isRunning = false;
    state.activity = "idle";
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
