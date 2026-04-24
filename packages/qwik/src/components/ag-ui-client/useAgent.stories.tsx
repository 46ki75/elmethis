import { component$, type CSSProperties } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { useAgent } from "./useAgent";

export interface UseAgentProps {
  class?: string;
  style?: CSSProperties;
  url?: string;
}

export const UseAgent = component$<UseAgentProps>(
  ({ class: className, style, url = "http://localhost:4111/ag-ui" }) => {
    const { AgentUI } = useAgent(url);
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
