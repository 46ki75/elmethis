import { component$, type CSSProperties } from "@qwik.dev/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";

import { useAgent } from "./use-agent";
import { ElmAgUiAgent } from "./elm-ag-ui-agent";
import { useMcpTools } from "./use-mcp-tools";

export interface UseMcpToolsProps {
  class?: string;
  style?: CSSProperties;
  agentUrl: string;
  mcpUrl: string;
}

const UseMcpToolsDemo = component$<UseMcpToolsProps>(
  ({ class: className, style, agentUrl, mcpUrl }) => {
    const { tools, status } = useMcpTools({
      servers: [{ id: "demo", url: mcpUrl }],
    });

    const { state, send$, retry$, abort$ } = useAgent({
      url: agentUrl,
      tools,
    });

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "0.8rem",
            padding: "0.5rem",
            background: "rgba(0,0,0,0.04)",
            borderRadius: "4px",
          }}
        >
          MCP status:{" "}
          {Object.entries(status)
            .map(
              ([id, s]) =>
                `${id}=${s.state}${s.toolCount != null ? `(${s.toolCount})` : ""}${s.error ? ` "${s.error}"` : ""}`,
            )
            .join(" ")}
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ElmAgUiAgent
            state={state}
            send$={send$}
            retry$={retry$}
            abort$={abort$}
            class={className}
            style={style}
          />
        </div>
      </div>
    );
  },
);

const meta: Meta<UseMcpToolsProps> = {
  title: "Components/AG-UI/hooks/useMcpTools",
  component: UseMcpToolsDemo,
  tags: ["autodocs"],
  args: {
    agentUrl:
      "http://localhost:19101/copilotkit/builtin/agent/minimax-m2.5-free/run",
    mcpUrl: "http://localhost:19101/mcp",
  },
  argTypes: {
    agentUrl: {
      description: "AG-UI agent endpoint.",
      control: "text",
    },
    mcpUrl: {
      description:
        "Streamable HTTP MCP server endpoint. Tools listed by the server are " +
        "surfaced through useAgent prefixed with the server id.",
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<UseMcpToolsProps>;

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
      <UseMcpToolsDemo {...args} />
    </div>
  ),
};
