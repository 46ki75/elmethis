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

/** A user message composed while a run was in flight, waiting its turn. */
export interface QueuedMessage {
  id: string;
  content: InputContent[];
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
  /**
   * Messages submitted while a run was in flight, held FIFO. They are sent
   * one at a time as each run settles successfully (see `onIdle` wiring).
   * `send$` appends here instead of starting a run when `isRunning`; `abort$`
   * pops the newest entry before it will abort an actual run.
   */
  queue: QueuedMessage[];
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
    queue: [],
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
          // The run just settled. If it succeeded and the user queued
          // messages while it was streaming, send the oldest one now — each
          // settle drains exactly one, so the chain continues until empty.
          // On error/abort we leave the queue untouched.
          onIdle: async () => {
            if (!agentRef.value) return;
            if (state.status !== "success") return;
            const next = state.queue.shift();
            if (!next) return;
            const userMessage: UserMessage = {
              id: next.id,
              role: "user",
              // Spread each item to plain objects — HttpAgent structuredClones
              // messages before sending, which throws on Qwik store proxies
              // (the queued content has been living in the reactive store).
              content: next.content.map(
                (item) => ({ ...item }) as InputContent,
              ),
            };
            agentRef.value.messages.push(userMessage);
            state.messages.push(userMessage);
            await executeRun(true);
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
    // A run is in flight — hold the message instead of starting a competing
    // run. It drains FIFO once the current run settles (see `onIdle`).
    if (state.isRunning) {
      state.queue.push({ id: v7(), content });
      return;
    }
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
    // Stop is a single gesture: it first unwinds queued messages newest-first
    // (an undo), and only aborts the live run once nothing is left queued.
    if (state.queue.length > 0) {
      state.queue.pop();
      return;
    }
    agentRef.value.abortRun();
    state.status = "aborted";
    state.isRunning = false;
    state.activity = "idle";
  });

  // Remove one specific queued message (the per-chip "×"), as opposed to
  // `abort`'s newest-first unwind. A no-op if the id has already drained.
  const dequeue = $((id: string) => {
    const index = state.queue.findIndex((q) => q.id === id);
    if (index === -1) return;
    state.queue.splice(index, 1);
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
    dequeue$: dequeue,
    addTool$: addTool,
    setContext$: setContext,
    setPromptTemplates$: setPromptTemplates,
  };
}
