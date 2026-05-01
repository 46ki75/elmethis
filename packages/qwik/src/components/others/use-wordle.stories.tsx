import type { Meta, StoryObj } from "storybook-framework-qwik";
import { component$ } from "@builder.io/qwik";
import { useWordle, type UseWordleOptions } from "./use-wordle";
import { useAgent } from "../ag-ui-client/useAgent";

const meta: Meta<UseWordleOptions> = {
  title: "Components/Others/use-wordle",
  tags: ["autodocs"],
  args: {},
};

export default meta;

type Story = StoryObj<UseWordleOptions>;

const Render = component$((args: UseWordleOptions) => {
  const { Wordle } = useWordle(args);
  return <Wordle />;
});

export const Primary: Story = {
  render: (args) => <Render {...args} />,
};

export const FixedWord: Story = {
  render: () => <Render initialWord="which" />,
};

export const WithLLM: Story = {
  render: (args) => {
    const Render = component$((args: UseWordleOptions) => {
      const { AgentUI } = useAgent({
        url: "http://localhost:19101/copilotkit/builtin/agent/gpt-5.4-nano/run",
      });
      const { Wordle } = useWordle(args);

      return (
        <div
          style={{
            display: "flex",
            gap: "20px",
            height: "calc(100dvh - 34px)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Wordle />
          <AgentUI />
        </div>
      );
    });

    return <Render {...args} />;
  },
};
