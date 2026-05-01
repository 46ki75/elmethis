import type { Meta, StoryObj } from "storybook-framework-qwik";
import { component$ } from "@builder.io/qwik";
import { useWordle, type UseWordleOptions } from "./use-wordle";
import { defineTool, useAgent } from "../ag-ui-client/useAgent";
import z from "zod";

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
      const { AgentUI, addTool } = useAgent({
        url: "http://localhost:19101/copilotkit/builtin/agent/gpt-5.4-nano/run",
      });
      const {
        Wordle,
        removeLetter,
        addLetter,
        submit,
        errorMessage,
        letterStatuses,
        gameStatus,
      } = useWordle(args);

      addTool(
        "submit_guess",
        defineTool({
          description:
            "Submit a guess to the Wordle game. The guess must be a valid 5-letter word.",
          schema: z.object({
            guess: z.string().length(5),
          }),
          async execute(args) {
            if (!/^[a-z]{5}$/.test(args.guess)) {
              return {
                success: false,
                message: "Guess must be a lowercase 5-letter word.",
              };
            }

            removeLetter();

            for (const letter of args.guess) {
              await new Promise((resolve) => setTimeout(resolve, 100));
              addLetter(letter);
            }

            submit();

            if (errorMessage.value.trim() !== "") {
              return {
                success: false,
                message: errorMessage.value,
              };
            } else if (gameStatus.value === "won") {
              return {
                success: true,
                message: "Congratulations! You've won the game.",
              };
            } else if (gameStatus.value === "lost") {
              return {
                success: true,
                message: "Game over. You've lost the game.",
              };
            } else {
              const statuses = Object.entries(letterStatuses.value);
              const statusMessage = statuses
                .map(([letter, status]) => `${letter}: ${status}`)
                .join(", ");
              return {
                success: true,
                message: `Guess submitted successfully. Letter statuses: ${statusMessage}`,
              };
            }
          },
        }),
      );

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
