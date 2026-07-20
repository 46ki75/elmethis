import { createMemo, createSignal, Show, untrack, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import {
  scenarioNames,
  StubAgent,
  type ScenarioName,
} from "@elmethis/ag-ui-stub";
import { v4, v7 } from "uuid";
import { z } from "zod";

import { ElmAgUiAgent } from "../components/elm-ag-ui-agent";
import type { ElmAgUiPromptDescriptor } from "../components/elm-ag-ui-prompt-picker";
import { defineTool, type ToolRegistry } from "../internal/tool-registry";
import { useMcpPrompts } from "../mcp/use-mcp-prompts";
import { useMcpTools } from "../mcp/use-mcp-tools";
import { useAgent, type UseAgentReturn } from "./use-agent";

export interface UseAgentProps {
  class?: string;
  style?: JSX.CSSProperties;
  scenario: "http" | ScenarioName;
  url: string;
  mcpUrl: string;
}

interface HttpUseAgentInstanceProps extends UseAgentProps {
  url: string;
  mcpUrl: string;
}

interface StubUseAgentInstanceProps {
  class?: string;
  style?: JSX.CSSProperties;
  scenario: ScenarioName;
}

interface AgentFrameProps {
  agent: UseAgentReturn;
  class?: string;
  style?: JSX.CSSProperties;
  prompts: ElmAgUiPromptDescriptor[];
  resolvePrompt: (
    key: string,
    args: Record<string, string>,
  ) => Promise<import("@ag-ui/client").InputContent[] | null>;
}

const resolveNoPrompt = async () => null;

const AgentFrame = (props: AgentFrameProps) => {
  const [enableToolCalls, setEnableToolCalls] = createSignal(true);
  const [enableReasoning, setEnableReasoning] = createSignal(true);

  return (
    <div
      style={{ display: "flex", "flex-direction": "column", height: "100%" }}
    >
      <div
        style={{
          display: "flex",
          "flex-shrink": 0,
          "align-items": "center",
          gap: "1rem",
          padding: "0.5rem 0.75rem",
          "border-bottom": "1px solid #ccc",
          "font-size": "0.875rem",
        }}
      >
        <label
          style={{
            display: "inline-flex",
            "align-items": "center",
            gap: "0.375rem",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={enableToolCalls()}
            onChange={(event) =>
              setEnableToolCalls(event.currentTarget.checked)
            }
          />
          Tool calls
        </label>
        <label
          style={{
            display: "inline-flex",
            "align-items": "center",
            gap: "0.375rem",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={enableReasoning()}
            onChange={(event) =>
              setEnableReasoning(event.currentTarget.checked)
            }
          />
          Reasoning
        </label>
      </div>
      <div style={{ flex: 1, "min-height": 0 }}>
        <ElmAgUiAgent
          class={props.class}
          style={props.style}
          state={props.agent.state}
          send={props.agent.send}
          retry={props.agent.retry}
          abort={props.agent.abort}
          dequeue={props.agent.dequeue}
          prompts={props.prompts}
          resolvePrompt={props.resolvePrompt}
          enableAutoScroll
          enableToolCalls={enableToolCalls()}
          enableReasoning={enableReasoning()}
        />
      </div>
    </div>
  );
};

const HttpUseAgentInstance = (props: HttpUseAgentInstanceProps) => {
  const url = untrack(() => props.url);
  const mcpUrl = untrack(() => props.mcpUrl);
  const localTools: ToolRegistry = {
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
  };
  const { tools: mcpTools } = useMcpTools({
    servers: [{ id: "weather", url: mcpUrl }],
  });
  const { prompts: mcpPrompts, resolve: resolveMcpPrompt } = useMcpPrompts({
    servers: [{ id: "weather", url: mcpUrl }],
  });
  const tools = createMemo<ToolRegistry>(() => ({
    ...localTools,
    ...mcpTools(),
  }));
  const prompts = createMemo<ElmAgUiPromptDescriptor[]>(() =>
    mcpPrompts().map((prompt) => ({
      key: `${prompt.serverId}::${prompt.name}`,
      name: prompt.name,
      description: prompt.description,
      arguments: prompt.arguments?.map((argument) => {
        const lookup = `${prompt.serverId}::${prompt.name}::${argument.name}`;
        const enumValues =
          lookup === "weather::weather_report::tone"
            ? ["formal", "casual", "poetic"]
            : undefined;
        const pattern =
          lookup === "weather::trip_planner::days" ? "^\\d+$" : undefined;
        return {
          ...argument,
          ...(enumValues ? { enum: enumValues } : {}),
          ...(pattern
            ? {
                pattern,
                patternMessage: "Days must be a positive integer.",
              }
            : {}),
        };
      }),
    })),
  );
  const resolvePrompt = async (key: string, args: Record<string, string>) => {
    const separator = key.indexOf("::");
    if (separator === -1) return null;
    return resolveMcpPrompt(
      key.slice(0, separator),
      key.slice(separator + 2),
      args,
    );
  };
  const agent = useAgent({
    url,
    context: [
      { description: "Current date and time", value: new Date().toString() },
      { description: "Location information", value: "Nerima, Tokyo, Japan" },
    ],
    tools,
  });
  agent.setPromptTemplates([
    {
      description: "Ask about AWS",
      content: "What is a new feature called Amazon S3 Files?",
    },
    { description: "Generate UUID v7", content: "Generate a UUID v7 string" },
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

  return (
    <AgentFrame
      agent={agent}
      class={props.class}
      style={props.style}
      prompts={prompts()}
      resolvePrompt={resolvePrompt}
    />
  );
};

const StubUseAgentInstance = (props: StubUseAgentInstanceProps) => {
  const scenario = untrack(() => props.scenario);
  const agent = useAgent({
    agentFactory: () => new StubAgent({ scenario, chunkDelayMs: 20 }),
  });

  return (
    <AgentFrame
      agent={agent}
      class={props.class}
      style={props.style}
      prompts={[]}
      resolvePrompt={resolveNoPrompt}
    />
  );
};

const UseAgent = (props: UseAgentProps) => (
  <Show
    when={props.scenario === "http"}
    fallback={
      <Show when={props.scenario as ScenarioName} keyed>
        {(scenario) => (
          <StubUseAgentInstance
            class={props.class}
            style={props.style}
            scenario={scenario}
          />
        )}
      </Show>
    }
  >
    <Show when={{ url: props.url, mcpUrl: props.mcpUrl }} keyed>
      {(endpoints) => (
        <HttpUseAgentInstance
          class={props.class}
          style={props.style}
          scenario="http"
          url={endpoints.url}
          mcpUrl={endpoints.mcpUrl}
        />
      )}
    </Show>
  </Show>
);

const meta = {
  title: "Components/AG-UI/hooks/useAgent",
  component: UseAgent,
  tags: ["autodocs"],
  args: {
    scenario: "text-stream",
    url: "http://localhost:19101/copilotkit/claude/agent/haiku/run",
    mcpUrl: "http://localhost:19101/mcp",
  },
  argTypes: {
    scenario: {
      description:
        "Run an in-process stub scenario, or select `http` for the live agent endpoint.",
      control: "radio",
      options: ["http", ...scenarioNames],
    },
    url: {
      description: "The live agent endpoint used when scenario is `http`.",
      control: "radio",
      options: [
        "http://localhost:19101/copilotkit/claude/agent/opus/run",
        "http://localhost:19101/copilotkit/claude/agent/sonnet/run",
        "http://localhost:19101/copilotkit/claude/agent/haiku/run",
      ],
    },
    mcpUrl: {
      description:
        "Streamable HTTP endpoint for the stub Weather MCP server (served by " +
        "packages/copilotkit at /mcp). Its tools are merged into useAgent " +
        "under the `weather__` prefix.",
      control: "text",
    },
  },
} satisfies Meta<typeof UseAgent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (args) => (
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
  ),
};

export const InProcessStub: Story = {
  args: {
    scenario: "full",
  },
  argTypes: {
    scenario: {
      description: "The deterministic in-process stub scenario to run.",
      control: "select",
      options: scenarioNames,
    },
    url: { table: { disable: true } },
    mcpUrl: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        story: "Runs `StubAgent` in-process without an HTTP backend.",
      },
    },
  },
  render: (args) => (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 34px)",
        border: "1px solid #ccc",
      }}
    >
      <UseAgent {...args} />
    </div>
  ),
};

export const Small: Story = {
  render: (args) => (
    <div style={{ width: "400px", height: "600px", border: "1px solid #ccc" }}>
      <UseAgent {...args} />
    </div>
  ),
};

export const Full: Story = {
  render: (args) => (
    <div style={{ width: "100%", height: "calc(100vh - 34px)" }}>
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
  ),
};
