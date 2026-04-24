import { component$, useTask$, type CSSProperties } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { v4, v7 } from "uuid";
import { z } from "zod";
import { defineTool, useAgent } from "./useAgent";

export interface UseAgentProps {
  class?: string;
  style?: CSSProperties;
  url?: string;
}

export const UseAgent = component$<UseAgentProps>(
  ({ class: className, style, url = "http://localhost:4111/ag-ui" }) => {
    const { AgentUI, addTool } = useAgent({ url });

    useTask$(() => {
      addTool(
        "generateUuid",
        defineTool({
          description: "Generate a random UUID v4 string",
          schema: z.object({
            version: z
              .enum(["v4", "v7"])
              .describe(
                "The version of UUID to generate. Supported values are 'v4' and 'v7'.",
              ),
          }),
          execute: ({ version }) => ({ uuid: version === "v4" ? v4() : v7() }),
        }),
      );
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

export const Primary: Story = {};
