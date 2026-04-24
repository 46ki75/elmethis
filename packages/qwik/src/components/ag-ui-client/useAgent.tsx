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

import {
  BaseEvent,
  compactEvents,
  HttpAgent,
  Message,
  randomUUID,
} from "@ag-ui/client";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ElmAgUiMessageRenderer } from "./elm-ag-ui-message-renderer";
import { ElmAgUiInput } from "./elm-ag-ui-input";

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
}

export function useAgent({ url, tools, context }: UseAgentOptions) {
  const httpAgent = useSignal<NoSerialize<HttpAgent> | null>(null);
  const toolsRef = useSignal<NoSerialize<ToolRegistry>>(noSerialize(tools));

  const agentStateStore = useStore<{
    messages: Message[];
    events: BaseEvent[];
    context?: {
      value: string;
      description: string;
    }[];
  }>({
    messages: [],
    events: [],
    context,
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (!httpAgent.value) {
      httpAgent.value = noSerialize(new HttpAgent({ url }));
      cleanup(() => {
        httpAgent.value = null;
      });
    }

    if (!httpAgent.value) return;

    let pendingToolMessages: Message[] = [];

    const subscription = httpAgent.value.subscribe({
      onEvent({ messages: newMessages, event }) {
        if (agentStateStore.messages.length < newMessages.length) {
          agentStateStore.messages.push(
            ...newMessages.slice(agentStateStore.messages.length),
          );
        }
        agentStateStore.events = compactEvents([
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
      onToolCallArgsEvent({ event }) {
        const msg = agentStateStore.messages.findLast(
          (m) => m.role === "assistant",
        );
        const toolCall = msg?.toolCalls?.find(
          (tc) => tc.id === event.toolCallId,
        );
        if (toolCall) toolCall.function.arguments += event.delta;
      },
      onToolCallEndEvent({ event, toolCallName }) {
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
          id: randomUUID(),
          role: "tool",
          content: JSON.stringify(tool.execute(args)),
          toolCallId: event.toolCallId,
        } as Message);
      },
      async onRunFinalized() {
        if (pendingToolMessages.length === 0 || !httpAgent.value) return;
        httpAgent.value.messages.push(...pendingToolMessages);
        pendingToolMessages = [];
        await httpAgent.value.runAgent({
          tools: getToolDefinitions(toolsRef.value ?? {}),
        });
      },
    });

    cleanup(() => {
      subscription.unsubscribe();
    });
  });

  const send = $(async (content: string) => {
    if (!httpAgent.value) return;
    httpAgent.value.messages.push({ id: randomUUID(), role: "user", content });
    await httpAgent.value.runAgent({
      tools: getToolDefinitions(toolsRef.value ?? {}),
      context: agentStateStore.context?.map(({ value, description }) => ({
        value,
        description,
      })),
    });
  });

  const addTool = $((name: string, tool: AnyToolDef) => {
    toolsRef.value = noSerialize({ ...(toolsRef.value ?? {}), [name]: tool });
  });

  const AgentUI = component$<{ class?: string; style?: CSSProperties }>(
    ({ class: className, style }) => {
      const input = useSignal("");

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
        <div class={[styles["use-agent"], className]} style={style}>
          <div>
            <ElmAgUiMessageRenderer messages={agentStateStore.messages} />
          </div>

          <div class={styles["agent-input"]}>
            <ElmAgUiInput onInput$={onInput$} onSubmit$={onSubmit$} />
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

  return {
    messages: agentStateStore.messages,
    events: agentStateStore.events,
    context: agentStateStore.context,
    setContext,
    send,
    addTool,
    AgentUI,
  };
}
