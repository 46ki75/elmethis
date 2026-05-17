import {
  $,
  component$,
  noSerialize,
  useComputed$,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
  type CSSProperties,
  type NoSerialize,
} from "@qwik.dev/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { v4, v7 } from "uuid";
import { z } from "zod";
import { useAgent } from "./use-agent";
import { ElmAgUiAgent } from "./elm-ag-ui-agent";
import { defineTool } from "./tool-registry";
import type { ToolRegistry } from "./tool-registry";
import { useMcpTools } from "./use-mcp-tools";
import { useMcpPrompts } from "./use-mcp-prompts";
import type { ElmAgUiPromptDescriptor } from "./elm-ag-ui-prompt-picker";

export interface UseAgentProps {
  class?: string;
  style?: CSSProperties;
  url: string;
  mcpUrl: string;
}

const UseAgent = component$<UseAgentProps>(
  ({ class: className, style, url, mcpUrl }) => {
    const context = useStore<Array<{ description: string; value: string }>>([]);

    // Weather MCP server: tools are listed asynchronously after
    // connect. The returned signal grows as the server becomes ready.
    const { tools: mcpTools } = useMcpTools({
      servers: [{ id: "weather", url: mcpUrl }],
    });

    // Same server, prompts side. We keep tools and prompts as separate
    // hooks so each can be composed independently; the picker UI is
    // rendered by ElmAgUiAgent given the descriptor list + resolve QRL.
    const { prompts: mcpPrompts, resolve$: resolveMcpPrompt$ } = useMcpPrompts({
      servers: [{ id: "weather", url: mcpUrl }],
    });

    // Per-prompt enum / pattern overrides. MCP's `prompts/list` only
    // carries (name, description, required), so any closed-set or
    // regex hints from the server's Zod schemas have to be re-applied
    // here at the mapping layer. See `useMcpPrompts` @remarks for the
    // full spec limitation; the unavoidable part is that server-side
    // validation errors still surface as raw Zod issues — these
    // overrides catch the common cases client-side before they reach
    // that path. Keyed by `${serverId}::${promptName}::${argName}`.
    const ENUM_OVERRIDES: Record<string, string[]> = {
      "weather::weather_report::tone": ["formal", "casual", "poetic"],
    };
    const PATTERN_OVERRIDES: Record<
      string,
      { pattern: string; message?: string }
    > = {
      "weather::trip_planner::days": {
        pattern: "^\\d+$",
        message: "Days must be a positive integer.",
      },
    };

    // Reshape MCP descriptors into the picker's generic shape. We
    // encode `(serverId, name)` into `key` so the resolver can split
    // them back apart without holding extra state.
    const pickerPrompts = useComputed$<ElmAgUiPromptDescriptor[]>(() =>
      mcpPrompts.value.map((p) => ({
        key: `${p.serverId}::${p.name}`,
        name: p.name,
        description: p.description,
        arguments: p.arguments?.map((a) => {
          const lookup = `${p.serverId}::${p.name}::${a.name}`;
          const enumValues = ENUM_OVERRIDES[lookup];
          const pattern = PATTERN_OVERRIDES[lookup];
          return {
            ...a,
            ...(enumValues ? { enum: enumValues } : {}),
            ...(pattern
              ? { pattern: pattern.pattern, patternMessage: pattern.message }
              : {}),
          };
        }),
      })),
    );

    const resolvePrompt$ = $(
      async (key: string, args: Record<string, string>) => {
        const sep = key.indexOf("::");
        if (sep === -1) return null;
        const serverId = key.slice(0, sep);
        const name = key.slice(sep + 2);
        return await resolveMcpPrompt$(serverId, name, args);
      },
    );

    // Local tools the agent should always see. The Zod schema is not
    // serializable, so build it inside a useVisibleTask$ (client-only)
    // — otherwise the value is constructed during SSR and dropped on
    // resume, and Qwik also refuses to walk the captured Zod instance
    // when validating the task's QRL boundary.
    const localToolsRef = useSignal<NoSerialize<ToolRegistry> | undefined>(
      undefined,
    );
    const mergedTools = useSignal<NoSerialize<ToolRegistry> | undefined>(
      undefined,
    );

    // `document-ready` strategy: the host component renders
    // `<ElmAgUiAgent>` (another component, not a direct DOM element),
    // so the default `intersection-observer` strategy can't attach
    // and Qwik would otherwise log a fallback warning at runtime.
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(
      () => {
        localToolsRef.value = noSerialize<ToolRegistry>({
          generateUuid: defineTool({
            description: "Generate a random UUID v4 or v7 string",
            schema: z.object({
              version: z
                .enum(["v4", "v7"])
                .describe(
                  "The version of UUID to generate. Supported values are 'v4' and 'v7'.",
                ),
            }),
            execute: async ({ version }) => ({
              uuid: version === "v4" ? v4() : v7(),
            }),
          }),
        });
      },
      { strategy: "document-ready" },
    );

    useTask$(({ track }) => {
      const local = track(() => localToolsRef.value);
      const mcp = track(() => mcpTools.value);
      mergedTools.value = noSerialize<ToolRegistry>({
        ...(local ?? {}),
        ...(mcp ?? {}),
      });
    });

    const { state, send$, retry$, abort$, setPromptTemplates$ } = useAgent({
      url,
      context,
      tools: mergedTools,
    });

    useTask$(() => {
      context.push({
        description: "Current date and time",
        value: new Date().toString(),
      });
      context.push({
        description: "Location information",
        value: "Nerima, Tokyo, Japan",
      });

      setPromptTemplates$([
        {
          description: "Ask about AWS",
          content: "What is a new feature called Amazon S3 Files?",
        },
        {
          description: "Generate UUID v7",
          content: "Generate a UUID v7 string",
        },
        {
          description: "Date and time",
          content: "What is the current date and time?",
        },
        {
          description: "Location information",
          content: "What is my current location?",
        },
        {
          description: "Render A2UI",
          content: `Could you render a \`Card\` and \`Text\` component with A2UI?

- catalogId: <https://a2ui.org/specification/v0_9/basic_catalog.json>
- surfaceId: \`my-card-surface\``,
        },
      ]);
    });

    return (
      <ElmAgUiAgent
        state={state}
        send$={send$}
        retry$={retry$}
        abort$={abort$}
        class={className}
        style={style}
        prompts={pickerPrompts.value}
        resolvePrompt$={resolvePrompt$}
      />
    );
  },
);

const meta: Meta<UseAgentProps> = {
  title: "Components/AG-UI/hooks/useAgent",
  component: UseAgent,
  tags: ["autodocs"],
  args: {
    url: "http://localhost:19101/copilotkit/builtin/agent/minimax-m2.5-free/run",
    mcpUrl: "http://localhost:19102/mcp",
  },
  argTypes: {
    url: {
      description: "The URL of the agent endpoint to connect to.",
      control: "radio",
      options: [
        "http://localhost:19101/copilotkit/builtin/agent/gpt-5.4-nano/run",
        "http://localhost:19101/copilotkit/builtin/agent/minimax-m2.5/run",
        "http://localhost:19101/copilotkit/builtin/agent/minimax-m2.5-free/run",
        "http://localhost:19101/copilotkit/builtin/agent/kimi-k2.6/run",
        "http://localhost:19101/copilotkit/mastra/agent/gpt-5.4-nano/run",
        "http://localhost:19101/copilotkit/mastra/agent/minimax-m2.5/run",
        "http://localhost:19101/copilotkit/mastra/agent/minimax-m2.5-free/run",
        "http://localhost:19101/copilotkit/mastra/agent/kimi-k2.6/run",
      ],
    },
    mcpUrl: {
      description:
        "Streamable HTTP endpoint for the Weather MCP server (packages/mcp-server). " +
        "Its tools are merged into useAgent under the `weather__` prefix.",
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<UseAgentProps>;

export const Primary: Story = {
  render: (args) => {
    return (
      <div
        style={{
          width: "100%",
          height: "calc(100vh - 34px)",
          border: "1px solid #ccc",
          padding: 0,
          margin: 0,
        }}
      >
        <UseAgent {...args} />
      </div>
    );
  },
};

export const Small: Story = {
  render: (args) => {
    return (
      <div
        style={{ width: "400px", height: "600px", border: "1px solid #ccc" }}
      >
        <UseAgent {...args} />
      </div>
    );
  },
};

export const Full: Story = {
  render: (args) => {
    return (
      <div
        style={{
          width: "100%",
          height: "calc(100vh - 34px)",
        }}
      >
        <div
          style={{
            width: "500px",
            height: "100%",
            border: "1px solid #ccc",
            padding: 0,
            margin: "0 auto",
          }}
        >
          <UseAgent {...args} />
        </div>
      </div>
    );
  },
};
