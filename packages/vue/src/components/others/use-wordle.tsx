import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  type Component,
  type ComputedRef,
} from "vue";
import { clsx } from "clsx";

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
// Reducer
// ---------------------------------------------------------------------------
interface WordleState {
  answer: string;
  board: LetterResult[][];
  currentGuess: string;
  gameStatus: GameStatus;
  letterStatuses: Record<string, LetterStatus>;
  errorMessage: string;
}

type WordleAction =
  | { type: "addLetter"; letter: string }
  | { type: "removeLetter" }
  | { type: "submit" }
  | { type: "reset"; answer: string };

function reducer(state: WordleState, action: WordleAction): WordleState {
  switch (action.type) {
    case "addLetter": {
      if (state.gameStatus !== "playing") return state;
      if (state.currentGuess.length >= MAX_WORD_LENGTH) return state;
      return {
        ...state,
        currentGuess: state.currentGuess + action.letter.toLowerCase(),
        errorMessage: "",
      };
    }

    case "removeLetter": {
      if (state.currentGuess.length === 0) return state;
      return {
        ...state,
        currentGuess: state.currentGuess.slice(0, -1),
        errorMessage: "",
      };
    }

    case "submit": {
      if (state.gameStatus !== "playing") return state;

      const guess = state.currentGuess;

      if (guess.length !== MAX_WORD_LENGTH) {
        return { ...state, errorMessage: "Not enough letters" };
      }

      if (!isValidGuess(guess)) {
        return { ...state, errorMessage: "Not in word list" };
      }

      const result = evaluateGuess(guess, state.answer);
      const board = [...state.board, result];

      const letterStatuses = { ...state.letterStatuses };
      for (const { letter, status } of result) {
        const current = letterStatuses[letter];
        if (current !== "correct") {
          if (status === "correct" || current !== "present") {
            letterStatuses[letter] = status;
          }
        }
      }

      let gameStatus: GameStatus = state.gameStatus;
      if (guess === state.answer) {
        gameStatus = "won";
      } else if (board.length >= MAX_CHALLENGES) {
        gameStatus = "lost";
      }

      return {
        ...state,
        board,
        letterStatuses,
        gameStatus,
        currentGuess: "",
        errorMessage: "",
      };
    }

    case "reset": {
      return {
        answer: action.answer,
        board: [],
        currentGuess: "",
        gameStatus: "playing",
        letterStatuses: {},
        errorMessage: "",
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------
export interface UseWordleReturn {
  answer: ComputedRef<string>;
  board: ComputedRef<LetterResult[][]>;
  currentGuess: ComputedRef<string>;
  gameStatus: ComputedRef<GameStatus>;
  letterStatuses: ComputedRef<Record<string, LetterStatus>>;
  errorMessage: ComputedRef<string>;
  submit: () => void;
  addLetter: (letter: string) => void;
  removeLetter: () => void;
  reset: () => void;
  Wordle: Component;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useWordle = (options?: UseWordleOptions): UseWordleReturn => {
  const state = ref<WordleState>({
    answer: options?.initialWord ?? getRandomWord(),
    board: [],
    currentGuess: "",
    gameStatus: "playing",
    letterStatuses: {},
    errorMessage: "",
  });

  const dispatch = (action: WordleAction): void => {
    state.value = reducer(state.value, action);
  };

  // Actions are stable across renders — they only `dispatch`.
  const addLetter = (letter: string): void =>
    dispatch({ type: "addLetter", letter });
  const removeLetter = (): void => dispatch({ type: "removeLetter" });
  const submit = (): void => dispatch({ type: "submit" });
  const reset = (): void =>
    dispatch({ type: "reset", answer: getRandomWord() });

  // Vue's reactivity re-renders the component when `state` changes, so (unlike
  // the React twin's useMemo) the component is created once and reads `state`
  // live.
  const Wordle = defineComponent({
    name: "Wordle",
    setup() {
      const onKeyDown = (e: KeyboardEvent) => {
        const { key, ctrlKey, altKey, metaKey } = e;
        if (ctrlKey || altKey || metaKey) return;
        if (key === "Enter") {
          submit();
        } else if (key === "Backspace") {
          removeLetter();
        } else if (/^[a-zA-Z]$/.test(key)) {
          addLetter(key);
        }
      };
      onMounted(() => document.addEventListener("keydown", onKeyDown));
      onBeforeUnmount(() => document.removeEventListener("keydown", onKeyDown));

      return () => {
        const {
          answer,
          board,
          currentGuess,
          gameStatus,
          letterStatuses,
          errorMessage,
        } = state.value;

        const rows = Array.from({ length: MAX_CHALLENGES }, (_, rowIndex) => {
          const submitted = board[rowIndex];
          const isCurrentRow =
            rowIndex === board.length && gameStatus === "playing";

          const cells = Array.from(
            { length: MAX_WORD_LENGTH },
            (_, colIndex) => {
              let letter = "";
              let cellStatus: LetterStatus | "empty" | "tbd" = "empty";

              if (submitted) {
                letter = submitted[colIndex].letter.toUpperCase();
                cellStatus = submitted[colIndex].status;
              } else if (isCurrentRow) {
                letter = (currentGuess[colIndex] ?? "").toUpperCase();
                cellStatus = letter ? "tbd" : "empty";
              }

              return (
                <div
                  key={colIndex}
                  class={clsx(
                    styles["cell"],
                    cellStatus === "correct" && styles["correct"],
                    cellStatus === "present" && styles["present"],
                    cellStatus === "absent" && styles["absent"],
                    cellStatus === "tbd" && styles["tbd"],
                    cellStatus === "empty" && styles["empty"],
                  )}
                >
                  {letter}
                </div>
              );
            },
          );

          return (
            <div key={rowIndex} class={styles["row"]}>
              {cells}
            </div>
          );
        });

        return (
          <div class={styles["elm-wordle"]}>
            <div
              class={clsx(
                styles["message-area"],
                errorMessage
                  ? styles["error"]
                  : gameStatus !== "playing"
                    ? styles["status"]
                    : undefined,
              )}
              aria-live="polite"
            >
              {errorMessage
                ? errorMessage
                : gameStatus === "won"
                  ? `🎉 You won in ${board.length} ${board.length === 1 ? "guess" : "guesses"}!`
                  : gameStatus === "lost"
                    ? `😢 The word was "${answer.toUpperCase()}"`
                    : null}
            </div>

            <div class={styles["board"]}>{rows}</div>

            <div
              class={styles["keyboard"]}
              onClick={(event: MouseEvent) => {
                const button = (event.target as HTMLElement).closest(
                  "button[data-key]",
                ) as HTMLButtonElement | null;
                const key = button?.dataset.key;
                if (!key) return;
                if (key === "Enter") {
                  submit();
                } else if (key === "⌫") {
                  removeLetter();
                } else {
                  addLetter(key);
                }
              }}
            >
              {KEYBOARD_ROWS.map((row, rowIndex) => (
                <div key={rowIndex} class={styles["keyboard-row"]}>
                  {row.map((key) => {
                    const lowerKey = key.toLowerCase();
                    const keyStatus = letterStatuses[lowerKey];
                    return (
                      <button
                        key={key}
                        data-key={key}
                        class={clsx(
                          styles["key"],
                          key === "Enter" && styles["wide"],
                          key === "⌫" && styles["wide"],
                          keyStatus === "correct" && styles["correct"],
                          keyStatus === "present" && styles["present"],
                          keyStatus === "absent" && styles["absent"],
                        )}
                      >
                        {key}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div
              class={clsx(
                styles["reset-container"],
                gameStatus === "playing" && styles["hidden"],
              )}
            >
              <button class={styles["reset-button"]} onClick={reset}>
                Play Again
              </button>
            </div>
          </div>
        );
      };
    },
  });

  return {
    answer: computed(() => state.value.answer),
    board: computed(() => state.value.board),
    currentGuess: computed(() => state.value.currentGuess),
    gameStatus: computed(() => state.value.gameStatus),
    letterStatuses: computed(() => state.value.letterStatuses),
    errorMessage: computed(() => state.value.errorMessage),
    submit,
    addLetter,
    removeLetter,
    reset,
    Wordle,
  };
};
