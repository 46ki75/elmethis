import { $, component$, useOnDocument, useSignal } from "@builder.io/qwik";

import styles from "./use-wordle.module.css";
import { WORDS } from "./wordle/wordlist";
import { VALIDGUESSES } from "./wordle/validGuesses";

// ---------------------------------------------------------------------------
// Constants (from SamuelQuinones/svelte-wordle settings.ts)
// ---------------------------------------------------------------------------
const MAX_WORD_LENGTH = 5;
const MAX_CHALLENGES = 6;

const WORD_SET: ReadonlySet<string> = Object.freeze(
  new Set([...VALIDGUESSES, ...WORDS]),
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type LetterStatus = "correct" | "present" | "absent";
export type GameStatus = "playing" | "won" | "lost";

export interface LetterResult {
  letter: string;
  status: LetterStatus;
}

export interface UseWordleOptions {
  /** Override the target word (useful for testing). Must be a lowercase 5-letter word. */
  initialWord?: string;
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------
function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function isValidGuess(guess: string): boolean {
  return WORD_SET.has(guess);
}

/**
 * Evaluates a guess against the answer using the standard Wordle algorithm:
 *  1. First pass marks exact matches (correct).
 *  2. Second pass marks letters present but in the wrong position, taking
 *     into account how many times each letter has already been accounted for.
 */
function evaluateGuess(guess: string, answer: string): LetterResult[] {
  const result: LetterResult[] = Array.from(
    { length: MAX_WORD_LENGTH },
    (_, i) => ({
      letter: guess[i],
      status: "absent" as LetterStatus,
    }),
  );

  const answerLetterCounts: Record<string, number> = {};
  for (let i = 0; i < MAX_WORD_LENGTH; i++) {
    answerLetterCounts[answer[i]] = (answerLetterCounts[answer[i]] ?? 0) + 1;
  }

  // First pass: mark correct letters and decrement their counts
  for (let i = 0; i < MAX_WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i].status = "correct";
      answerLetterCounts[guess[i]]--;
    }
  }

  // Second pass: mark present letters
  for (let i = 0; i < MAX_WORD_LENGTH; i++) {
    if (result[i].status === "correct") continue;
    const letter = guess[i];
    if ((answerLetterCounts[letter] ?? 0) > 0) {
      result[i].status = "present";
      answerLetterCounts[letter]--;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Keyboard layout
// ---------------------------------------------------------------------------
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useWordle = (options?: UseWordleOptions) => {
  const answer = useSignal(options?.initialWord ?? getRandomWord());
  const board = useSignal<LetterResult[][]>([]);
  const currentGuess = useSignal("");
  const gameStatus = useSignal<GameStatus>("playing");
  const letterStatuses = useSignal<Record<string, LetterStatus>>({});
  const errorMessage = useSignal("");

  const addLetter = $((letter: string) => {
    if (gameStatus.value !== "playing") return;
    if (currentGuess.value.length >= MAX_WORD_LENGTH) return;
    currentGuess.value += letter.toLowerCase();
    errorMessage.value = "";
  });

  const removeLetter = $(() => {
    if (currentGuess.value.length === 0) return;
    currentGuess.value = currentGuess.value.slice(0, -1);
    errorMessage.value = "";
  });

  const submit = $(() => {
    if (gameStatus.value !== "playing") return;

    const guess = currentGuess.value;

    if (guess.length !== MAX_WORD_LENGTH) {
      errorMessage.value = "Not enough letters";
      return;
    }

    if (!isValidGuess(guess)) {
      errorMessage.value = "Not in word list";
      return;
    }

    const result = evaluateGuess(guess, answer.value);
    board.value = [...board.value, result];

    const updatedStatuses = { ...letterStatuses.value };
    for (const { letter, status } of result) {
      const current = updatedStatuses[letter];
      if (current !== "correct") {
        if (status === "correct" || current !== "present") {
          updatedStatuses[letter] = status;
        }
      }
    }
    letterStatuses.value = updatedStatuses;

    if (guess === answer.value) {
      gameStatus.value = "won";
    } else if (board.value.length >= MAX_CHALLENGES) {
      gameStatus.value = "lost";
    }

    currentGuess.value = "";
    errorMessage.value = "";
  });

  const reset = $(() => {
    answer.value = getRandomWord();
    board.value = [];
    currentGuess.value = "";
    gameStatus.value = "playing";
    letterStatuses.value = {};
    errorMessage.value = "";
  });

  const Wordle = component$(() => {
    useOnDocument(
      "keydown",
      $((e: Event) => {
        const { key, ctrlKey, altKey, metaKey } = e as KeyboardEvent;
        if (ctrlKey || altKey || metaKey) return;
        if (key === "Enter") {
          submit();
        } else if (key === "Backspace") {
          removeLetter();
        } else if (/^[a-zA-Z]$/.test(key)) {
          addLetter(key);
        }
      }),
    );

    const rows = Array.from({ length: MAX_CHALLENGES }, (_, rowIndex) => {
      const submitted = board.value[rowIndex];
      const isCurrentRow =
        rowIndex === board.value.length && gameStatus.value === "playing";

      const cells = Array.from({ length: MAX_WORD_LENGTH }, (_, colIndex) => {
        let letter = "";
        let cellStatus: LetterStatus | "empty" | "tbd" = "empty";

        if (submitted) {
          letter = submitted[colIndex].letter.toUpperCase();
          cellStatus = submitted[colIndex].status;
        } else if (isCurrentRow) {
          letter = (currentGuess.value[colIndex] ?? "").toUpperCase();
          cellStatus = letter ? "tbd" : "empty";
        }

        return (
          <div
            key={colIndex}
            class={[
              styles["cell"],
              cellStatus === "correct" && styles["cell--correct"],
              cellStatus === "present" && styles["cell--present"],
              cellStatus === "absent" && styles["cell--absent"],
              cellStatus === "tbd" && styles["cell--tbd"],
              cellStatus === "empty" && styles["cell--empty"],
            ]}
          >
            {letter}
          </div>
        );
      });

      return (
        <div key={rowIndex} class={styles["row"]}>
          {cells}
        </div>
      );
    });

    return (
      <div class={styles["wordle"]}>
        {errorMessage.value && (
          <div class={styles["error-message"]}>{errorMessage.value}</div>
        )}

        {gameStatus.value === "won" && (
          <div
            class={styles["status-message"]}
          >{`🎉 You won in ${board.value.length} ${board.value.length === 1 ? "guess" : "guesses"}!`}</div>
        )}

        {gameStatus.value === "lost" && (
          <div
            class={styles["status-message"]}
          >{`😢 The word was "${answer.value.toUpperCase()}"`}</div>
        )}

        <div class={styles["board"]}>{rows}</div>

        <div class={styles["keyboard"]}>
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} class={styles["keyboard-row"]}>
              {row.map((key) => {
                const lowerKey = key.toLowerCase();
                const keyStatus = letterStatuses.value[lowerKey];
                return (
                  <button
                    key={key}
                    class={[
                      styles["key"],
                      key === "Enter" && styles["key--wide"],
                      key === "⌫" && styles["key--wide"],
                      keyStatus === "correct" && styles["key--correct"],
                      keyStatus === "present" && styles["key--present"],
                      keyStatus === "absent" && styles["key--absent"],
                    ]}
                    onClick$={() => {
                      if (key === "Enter") {
                        submit();
                      } else if (key === "⌫") {
                        removeLetter();
                      } else {
                        addLetter(key);
                      }
                    }}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {gameStatus.value !== "playing" && (
          <div class={styles["reset-container"]}>
            <button class={styles["reset-button"]} onClick$={reset}>
              Play Again
            </button>
          </div>
        )}
      </div>
    );
  });

  return {
    answer,
    board,
    currentGuess,
    gameStatus,
    letterStatuses,
    errorMessage,
    submit,
    addLetter,
    removeLetter,
    reset,
    Wordle,
  };
};
