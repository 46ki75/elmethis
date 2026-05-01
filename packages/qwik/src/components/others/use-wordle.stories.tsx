import type { Meta, StoryObj } from "storybook-framework-qwik";
import { component$, useTask$ } from "@builder.io/qwik";
import { useWordle, type UseWordleOptions } from "./use-wordle";
import { defineTool, useAgent } from "../ag-ui-client/useAgent";
import z from "zod";

import prompt from "./wordle/prompt.md?raw";

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const WithLLMRender = component$((args: UseWordleOptions) => {
  const { AgentUI, addTool, setPromptTemplates } = useAgent({
    url: "http://localhost:19101/copilotkit/wordle/agent/default/run",
    enableAutoScroll: true,
  });

  const {
    Wordle,
    removeLetter,
    addLetter,
    submit,
    errorMessage,
    letterStatuses,
    board,
    gameStatus,
    answer,
  } = useWordle(args);

  useTask$(() => {
    setPromptTemplates([
      {
        description: "Solve wordle",
        value: prompt,
      },
    ]);

    addTool(
      "submit_guess",
      defineTool({
        description:
          "Submit a 5-letter guess to the Wordle game. " +
          "Returns the per-position result for the guess and the accumulated known letter statuses.",
        schema: z.object({
          guess: z
            .string()
            .length(5)
            .describe("A 5-letter lowercase word to guess (a-z only)."),
        }),
        async execute({ guess }) {
          if (!/^[a-z]{5}$/.test(guess)) {
            return {
              success: false,
              error: "Guess must be exactly 5 lowercase letters (a-z).",
            };
          }

          await sleep(100);
          for (let i = 0; i < 5; i++) {
            await removeLetter();
            await sleep(100);
          }
          for (const letter of guess) {
            await addLetter(letter);
            await sleep(100);
          }

          await submit();
          await sleep(100);

          if (errorMessage.value.trim() !== "") {
            return { success: false, error: errorMessage.value };
          }

          // Position-by-position result for this guess (1-indexed for LLM readability)
          const lastRow = board.value.at(-1)!;
          const guessResult = lastRow.map(({ letter, status }, i) => ({
            position: i + 1,
            letter,
            // "correct"  = right letter, right position (green)
            // "present"  = right letter, wrong position (yellow)
            // "absent"   = letter not in the word (gray)
            status,
          }));

          const guessesUsed = board.value.length;

          if (gameStatus.value === "won") {
            return {
              success: true,
              gameStatus: "won",
              guessResult,
              guessesUsed,
            };
          }

          if (gameStatus.value === "lost") {
            return {
              success: true,
              gameStatus: "lost",
              guessResult,
              guessesUsed,
              answer: answer.value,
            };
          }

          // Group accumulated letter knowledge by category
          const knownLetters: Record<
            "correct" | "present" | "absent",
            string[]
          > = { correct: [], present: [], absent: [] };
          for (const [letter, status] of Object.entries(letterStatuses.value)) {
            knownLetters[status].push(letter);
          }

          return {
            success: true,
            gameStatus: "playing",
            guessResult,
            guessesRemaining: 6 - guessesUsed,
            knownLetters,
          };
        },
      }),
    );
  });

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

export const WithLLM: Story = {
  render: (args) => <WithLLMRender {...args} />,
};
