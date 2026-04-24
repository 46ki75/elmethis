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
  url?: string;
}

export const UseAgent = component$<UseAgentProps>(
  ({ class: className, style, url = "http://localhost:4111/ag-ui" }) => {
    const context = useStore<Array<{ description: string; value: string }>>([]);

    const { AgentUI, addTool } = useAgent({
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
    });

    return <AgentUI class={className} style={style} />;
  },
);

const meta: Meta<UseAgentProps> = {
  title: "Components/AG-UI/hooks/useAgent",
  component: UseAgent,
  tags: ["autodocs"],
  args: {},
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
