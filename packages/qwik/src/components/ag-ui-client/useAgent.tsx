import {
  $,
  component$,
  NoSerialize,
  noSerialize,
  useSignal,
  useStore,
  useVisibleTask$,
  type CSSProperties,
} from "@builder.io/qwik";

import styles from "./useAgent.module.css";

import { BaseEvent, HttpAgent, Message, UserMessage } from "@ag-ui/client";
import { compactEventsExtended } from "./compactEventsExtended";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ElmAgUiMessageRenderer } from "./elm-ag-ui-message-renderer";
import { ElmAgUiInput } from "./elm-ag-ui-input";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiAlert, mdiForumOutline, mdiRefresh } from "@mdi/js";

import { v7 } from "uuid";

// ---------------------------------------------------------------------------
// Tool registry
// ---------------------------------------------------------------------------

export interface ToolDef<T extends z.ZodObject<z.ZodRawShape>> {
  description: string;
  schema: T;
  execute: (args: z.infer<T>) => unknown;
}

export type AnyToolDef = ToolDef<z.ZodObject<z.ZodRawShape>>;
export type ToolRegistry = Record<string, AnyToolDef>;

/**
 * Define a tool with full type inference on the `execute` callback args.
 *
 * TypeScript infers `T` from the `schema` field, so `execute` receives the
 * exact shape produced by `z.infer<T>` rather than the erased `ZodRawShape`.
 * The result is cast to {@link AnyToolDef} so it can be passed directly to
 * {@link addTool}.
 *
 * @example
 * ```ts
 * defineTool({
 *   description: "Generate a random UUID",
 *   schema: z.object({ version: z.enum(["v4", "v7"]) }),
 *   execute: async ({ version }) => ({ uuid: version === "v4" ? v4() : v7() }),
 * });
 * ```
 */
export function defineTool<T extends z.ZodObject<z.ZodRawShape>>(
  tool: ToolDef<T>,
): AnyToolDef {
  return tool as unknown as AnyToolDef;
}

export function getToolDefinitions(registry: ToolRegistry) {
  return Object.entries(registry).map(([name, { description, schema }]) => ({
    name,
    description,
    parameters: zodToJsonSchema(schema) as {
      type: "object";
      properties: Record<string, unknown>;
      required: string[];
    },
  }));
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseAgentOptions {
  url: string;
  tools?: ToolRegistry;
  context?: {
    value: string;
    description: string;
  }[];
  headers?: Record<string, string> | undefined;
  initialMessages?: Message[];
}

export function useAgent({
  url,
  tools,
  context,
  headers,
  initialMessages,
}: UseAgentOptions) {
  const httpAgent = useSignal<NoSerialize<HttpAgent> | null>(null);
  const toolsRef = useSignal<NoSerialize<ToolRegistry>>(noSerialize(tools));

  const agentStateStore = useStore<{
    error: string | null;
    messages: Message[];
    events: BaseEvent[];
    context?: {
      value: string;
      description: string;
    }[];
    isRunning: boolean;
    promptTemplates: { description: string; value: string }[];
  }>({
    error: null,
    messages: initialMessages ?? [],
    events: [],
    context,
    isRunning: false,
    promptTemplates: [],
  });

  const executeRun = $(async (withContext: boolean) => {
    if (!httpAgent.value) return;
    agentStateStore.error = null;
    try {
      await httpAgent.value.runAgent({
        tools: getToolDefinitions(toolsRef.value ?? {}),
        ...(withContext && {
          context: agentStateStore.context?.map(({ value, description }) => ({
            value,
            description,
          })),
        }),
      });
    } catch {
      agentStateStore.isRunning = false;
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup, track }) => {
    const trackedUrl = track(() => url);
    const trackedHeaders = track(() => (headers ? { ...headers } : undefined));

    httpAgent.value = noSerialize(
      new HttpAgent({ url: trackedUrl, headers: trackedHeaders }),
    );
    cleanup(() => {
      httpAgent.value = null;
    });

    const agent = httpAgent.value;
    if (!agent) return;

    let pendingToolMessages: Message[] = [];

    const subscription = agent.subscribe({
      onRunInitialized() {
        agentStateStore.isRunning = true;
      },
      onEvent({ messages: newMessages, event }) {
        if (agentStateStore.messages.length < newMessages.length) {
          agentStateStore.messages.push(
            ...newMessages.slice(agentStateStore.messages.length),
          );
        }
        agentStateStore.events = compactEventsExtended([
          ...agentStateStore.events,
          event,
        ]);
      },

      onTextMessageContentEvent({ event }) {
        const msg = agentStateStore.messages.findLast(
          (m) => m.role === "assistant",
        );
        if (msg) msg.content = (msg.content ?? "") + event.delta;
      },

      onReasoningMessageContentEvent({ event }) {
        const msg = agentStateStore.messages.findLast(
          (m) => m.role === "reasoning",
        );
        if (msg) msg.content = (msg.content ?? "") + event.delta;
      },

      onActivityDeltaEvent({ activityMessage }) {
        const msg = agentStateStore.messages.findLast(
          (m) => m.role === "activity",
        );
        if (msg && activityMessage) msg.content = activityMessage.content;
      },

      onToolCallArgsEvent({ event }) {
        const msg = agentStateStore.messages.findLast(
          (m) => m.role === "assistant",
        );
        const toolCall = msg?.toolCalls?.find(
          (tc) => tc.id === event.toolCallId,
        );
        if (toolCall) toolCall.function.arguments += event.delta;
      },
      async onToolCallEndEvent({ event, toolCallName }) {
        const registry: ToolRegistry = toolsRef.value ?? {};
        const tool = registry[toolCallName];
        if (!tool) return;
        const msg = agentStateStore.messages.findLast(
          (m) => m.role === "assistant",
        );
        const toolCall = msg?.toolCalls?.find(
          (tc) => tc.id === event.toolCallId,
        );
        const args = toolCall?.function.arguments
          ? JSON.parse(toolCall.function.arguments)
          : {};
        pendingToolMessages.push({
          id: v7(),
          role: "tool",
          content: JSON.stringify(await tool.execute(args)),
          toolCallId: event.toolCallId,
        } as Message);
      },
      async onRunFinalized() {
        if (import.meta.env.DEV)
          console.log({
            messages: agentStateStore.messages,
            events: agentStateStore.events,
          });

        if (pendingToolMessages.length === 0 || !httpAgent.value) {
          agentStateStore.isRunning = false;
          return;
        }
        httpAgent.value.messages.push(...pendingToolMessages);
        pendingToolMessages = [];
        await executeRun(false);
      },

      onRunFailed({ error }) {
        agentStateStore.error = error.message;
      },

      onRunErrorEvent({ event }) {
        agentStateStore.error = event.message;
      },
    });

    cleanup(() => {
      subscription.unsubscribe();
    });
  });

  const send = $(async (content: string) => {
    if (!httpAgent.value) return;
    const userMessage: UserMessage = {
      id: v7(),
      role: "user",
      content,
    };
    httpAgent.value.messages.push(userMessage);
    agentStateStore.messages.push(userMessage);
    await executeRun(true);
  });

  const retry = $(async () => {
    if (!httpAgent.value) return;

    const lastUserMessageIndex = agentStateStore.messages.findLastIndex(
      (m) => m.role === "user",
    );
    if (lastUserMessageIndex === -1) return;

    // Remove all messages after the last user message
    const newMessages = httpAgent.value.messages.slice(
      0,
      lastUserMessageIndex + 1,
    );
    httpAgent.value.messages = [...newMessages];
    agentStateStore.messages = [...newMessages];
    await executeRun(true);
  });

  /**
   * Register a tool that the agent can call during a run.
   * Wrap the tool definition with {@link defineTool} to get typed `execute` args.
   *
   * @example
   * ```ts
   * addTool(
   *   "generateUuid",
   *   defineTool({
   *     description: "Generate a random UUID",
   *     schema: z.object({ version: z.enum(["v4", "v7"]) }),
   *     execute: async ({ version }) => ({ uuid: version === "v4" ? v4() : v7() }),
   *   }),
   * );
   * ```
   */
  const addTool = $((name: string, tool: AnyToolDef) => {
    toolsRef.value = noSerialize({ ...(toolsRef.value ?? {}), [name]: tool });
  });

  const abort = $(() => {
    httpAgent.value?.abortRun();
  });

  const AgentUI = component$<{ class?: string; style?: CSSProperties }>(
    ({ class: className, style }) => {
      const input = useSignal("");
      const containerRef = useSignal<HTMLElement>();
      const lastScrollTime = useSignal(0);

      // eslint-disable-next-line qwik/no-use-visible-task
      useVisibleTask$(({ track }) => {
        track(() => agentStateStore.messages.length);
        const now = Date.now();
        if (now - lastScrollTime.value < 500) return;
        lastScrollTime.value = now;
        containerRef.value?.scrollTo({
          behavior: "smooth",
          top: containerRef.value.scrollHeight,
        });
      });

      const onInput$ = $((_event: InputEvent, element: HTMLTextAreaElement) => {
        input.value = element.value;
      });

      const onSubmit$ = $((_event: Event, element: Element) => {
        if (input.value.trim() === "") return;
        send(input.value);
        input.value = "";
        const textarea = element.querySelector("textarea");
        if (textarea) textarea.value = "";
      });

      return (
        <div
          ref={containerRef}
          class={[styles["use-agent"], className]}
          style={style}
        >
          <div class={styles["agent-container"]}>
            <div class={styles["messages"]}>
              <ElmAgUiMessageRenderer
                isRunning={agentStateStore.isRunning}
                messages={agentStateStore.messages}
                handleRetry$={retry}
              />

              {agentStateStore.error && (
                <>
                  <div class={styles["error"]}>
                    <ElmMdiIcon d={mdiAlert} color="#c56565" />
                    <ElmInlineText color="#c56565">
                      {agentStateStore.error}
                    </ElmInlineText>
                  </div>

                  <span class={styles["clickable-icon"]} onClick$={retry}>
                    <ElmMdiIcon d={mdiRefresh} size="1.25rem" />
                  </span>
                </>
              )}
            </div>
          </div>

          <div class={styles["agent-input-container"]}>
            <div class={styles["agent-input"]}>
              {!agentStateStore.isRunning && (
                <div class={styles["prompt-template-container"]}>
                  {agentStateStore.promptTemplates.map((template, index) => (
                    <span
                      key={index}
                      class={styles["prompt-template-tip"]}
                      onClick$={() => send(template.value)}
                    >
                      <ElmMdiIcon d={mdiForumOutline} color="#cdb57b" />
                      <ElmInlineText>{template.description}</ElmInlineText>
                    </span>
                  ))}
                </div>
              )}

              <ElmAgUiInput
                onInput$={onInput$}
                onSubmit$={onSubmit$}
                onAbort$={abort}
                isRunning={agentStateStore.isRunning}
              />
            </div>
          </div>
        </div>
      );
    },
  );

  const setContext = $(
    (newContext: { value: string; description: string }[]) => {
      agentStateStore.context = newContext;
    },
  );

  const setPromptTemplates = $(
    (templates: { description: string; value: string }[]) => {
      agentStateStore.promptTemplates = templates;
    },
  );

  return {
    messages: agentStateStore.messages,
    events: agentStateStore.events,
    context: agentStateStore.context,
    setContext,
    promptTemplates: agentStateStore.promptTemplates,
    setPromptTemplates,
    send,
    addTool,
    abort,
    AgentUI,
  };
}
