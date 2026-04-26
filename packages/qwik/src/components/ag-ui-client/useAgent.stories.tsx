import {
  component$,
  useStore,
  useTask$,
  type CSSProperties,
} from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { v4, v7 } from "uuid";
import { z } from "zod";
import { useAgent } from "./useAgent";

export interface UseAgentProps {
  class?: string;
  style?: CSSProperties;
  url: string;
}

const UseAgent = component$<UseAgentProps>(
  ({ class: className, style, url }) => {
    const context = useStore<Array<{ description: string; value: string }>>([]);

    const { AgentUI, addTool, setPromptTemplates } = useAgent({
      url,
      context: context,
    });

    useTask$(() => {
      addTool("generateUuid", {
        description: "Generate a random UUID v4 string",
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
      });

      context.push({
        description: "Current date and time",
        value: new Date().toString(),
      });
      context.push({
        description: "Location information",
        value: "Nerima, Tokyo, Japan",
      });

      setPromptTemplates([
        {
          description: "Ask about AWS",
          value: "What is a new feature called Amazon S3 Files?",
        },
        {
          description: "Date and time",
          value: "What is the current date and time?",
        },
        {
          description: "Location information",
          value: "What is my current location?",
        },
        {
          description: "Render A2UI",
          value: `Could you render a \`Card\` and \`Text\` component with A2UI?

- catalogId: <https://a2ui.org/specification/v0_9/basic_catalog.json>
- surfaceId: \`my-card-surface\``,
        },
      ]);
    });

    return <AgentUI class={className} style={style} />;
  },
);

const meta: Meta<UseAgentProps> = {
  title: "Components/AG-UI/hooks/useAgent",
  component: UseAgent,
  tags: ["autodocs"],
  args: {
    url: "http://localhost:8080/copilotkit/agent/minimax-m2.5-free/run",
  },
  argTypes: {
    url: {
      description: "The URL of the agent endpoint to connect to.",
      control: "radio",
      options: [
        "http://localhost:8080/copilotkit/agent/gpt-5.4-nano/run",
        "http://localhost:8080/copilotkit/agent/minimax-m2.5/run",
        "http://localhost:8080/copilotkit/agent/minimax-m2.5-free/run",
        "http://localhost:8080/copilotkit/agent/kimi-k2.6/run",
      ],
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
