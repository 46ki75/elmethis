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
  UserMessage,
} from "@ag-ui/client";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ElmAgUiMessageRenderer } from "./elm-ag-ui-message-renderer";
import { ElmAgUiInput } from "./elm-ag-ui-input";

async function sh256(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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
  headers?: Record<string, string> | undefined;

  autoAddContext?: boolean;
}

export function useAgent({
  url,
  tools,
  context,
  headers,
  autoAddContext = true,
}: UseAgentOptions) {
  const httpAgent = useSignal<NoSerialize<HttpAgent> | null>(null);
  const toolsRef = useSignal<NoSerialize<ToolRegistry>>(noSerialize(tools));

  const agentStateStore = useStore<{
    messages: Message[];
    events: BaseEvent[];
    context?: {
      value: string;
      description: string;
    }[];
    isRunning: boolean;
  }>({
    messages: [],
    events: [],
    context,
    isRunning: false,
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (!httpAgent.value) {
      httpAgent.value = noSerialize(new HttpAgent({ url, headers }));
      cleanup(() => {
        httpAgent.value = null;
      });
    }

    if (!httpAgent.value) return;

    let pendingToolMessages: Message[] = [];

    const subscription = httpAgent.value.subscribe({
      onRunInitialized() {
        agentStateStore.isRunning = true;
      },
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
          id: randomUUID(),
          role: "tool",
          content: JSON.stringify(await tool.execute(args)),
          toolCallId: event.toolCallId,
        } as Message);
      },
      async onRunFinalized() {
        console.log(agentStateStore.messages);
        if (pendingToolMessages.length === 0 || !httpAgent.value) {
          agentStateStore.isRunning = false;
          return;
        }
        httpAgent.value.messages.push(...pendingToolMessages);
        pendingToolMessages = [];
        try {
          await httpAgent.value.runAgent({
            tools: getToolDefinitions(toolsRef.value ?? {}),
          });
        } catch {
          agentStateStore.isRunning = false;
        }
      },
    });

    cleanup(() => {
      subscription.unsubscribe();
    });
  });

  const send = $(async (content: string) => {
    if (!httpAgent.value) return;
    const userMessage: UserMessage = {
      id: randomUUID(),
      role: "user",
      content,
    };
    httpAgent.value.messages.push(userMessage);

    if (autoAddContext) {
      const hash = await sh256(JSON.stringify(agentStateStore.context));
      const id = `ag-ui-client-context-${hash}`;
      const contextSystemMessage: Message = {
        id,
        role: "system",
        content: `## Context\n\n${agentStateStore.context
          ?.map((c) => `- ${c.value}: ${c.description}`)
          .join("\n")}`,
      };
      const isContextFresh = httpAgent.value.messages.some((m) => m.id === id);
      if (!isContextFresh) {
        httpAgent.value.messages = httpAgent.value.messages.filter(
          (m) => m.id !== id,
        );
        httpAgent.value.messages.push(contextSystemMessage);
      }
    }

    try {
      await httpAgent.value.runAgent({
        tools: getToolDefinitions(toolsRef.value ?? {}),
        context: agentStateStore.context?.map(({ value, description }) => ({
          value,
          description,
        })),
      });
    } catch {
      agentStateStore.isRunning = false;
    }
  });

  const addTool = $((name: string, tool: AnyToolDef) => {
    toolsRef.value = noSerialize({ ...(toolsRef.value ?? {}), [name]: tool });
  });

  const abort = $(() => {
    httpAgent.value?.abortRun();
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
          <div class={styles["messages"]}>
            <ElmAgUiMessageRenderer messages={agentStateStore.messages} />
          </div>

          <div class={styles["agent-input"]}>
            <ElmAgUiInput
              onInput$={onInput$}
              onSubmit$={onSubmit$}
              onAbort$={abort}
              isRunning={agentStateStore.isRunning}
            />
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
    abort,
    AgentUI,
  };
}
