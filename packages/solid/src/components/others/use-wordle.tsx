import {
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  type Component,
  type JSX,
} from "solid-js";
import { clsx } from "clsx";

import styles from "./use-wordle.module.css";
import { VALIDGUESSES } from "./wordle/validGuesses";
import { WORDS } from "./wordle/wordlist";

const MAX_WORD_LENGTH = 5;
const MAX_CHALLENGES = 6;

const WORD_SET: ReadonlySet<string> = new Set([...VALIDGUESSES, ...WORDS]);
const ROW_INDEXES = Array.from({ length: MAX_CHALLENGES }, (_, index) => index);
const COLUMN_INDEXES = Array.from(
  { length: MAX_WORD_LENGTH },
  (_, index) => index,
);
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

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

type CellStatus = LetterStatus | "empty" | "tbd";

interface CellResult {
  letter: string;
  status: CellStatus;
}

function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function evaluateGuess(guess: string, answer: string): LetterResult[] {
  const result: LetterResult[] = Array.from(
    { length: MAX_WORD_LENGTH },
    (_, index) => ({ letter: guess[index], status: "absent" }),
  );
  const answerLetterCounts: Record<string, number> = {};

  for (let index = 0; index < MAX_WORD_LENGTH; index++) {
    const letter = answer[index];
    answerLetterCounts[letter] = (answerLetterCounts[letter] ?? 0) + 1;
  }

  for (let index = 0; index < MAX_WORD_LENGTH; index++) {
    if (guess[index] === answer[index]) {
      result[index] = { letter: guess[index], status: "correct" };
      answerLetterCounts[guess[index]]--;
    }
  }

  for (let index = 0; index < MAX_WORD_LENGTH; index++) {
    const letterResult = result[index];
    if (letterResult.status === "correct") continue;
    if ((answerLetterCounts[letterResult.letter] ?? 0) > 0) {
      result[index] = { ...letterResult, status: "present" };
      answerLetterCounts[letterResult.letter]--;
    }
  }

  return result;
}

function reducer(state: WordleState, action: WordleAction): WordleState {
  switch (action.type) {
    case "addLetter":
      if (
        state.gameStatus !== "playing" ||
        state.currentGuess.length >= MAX_WORD_LENGTH
      ) {
        return state;
      }
      return {
        ...state,
        currentGuess: state.currentGuess + action.letter.toLowerCase(),
        errorMessage: "",
      };

    case "removeLetter":
      if (state.currentGuess.length === 0) return state;
      return {
        ...state,
        currentGuess: state.currentGuess.slice(0, -1),
        errorMessage: "",
      };

    case "submit": {
      if (state.gameStatus !== "playing") return state;
      if (state.currentGuess.length !== MAX_WORD_LENGTH) {
        return { ...state, errorMessage: "Not enough letters" };
      }
      if (!WORD_SET.has(state.currentGuess)) {
        return { ...state, errorMessage: "Not in word list" };
      }

      const result = evaluateGuess(state.currentGuess, state.answer);
      const board = [...state.board, result];
      const letterStatuses = { ...state.letterStatuses };

      for (const { letter, status } of result) {
        const current = letterStatuses[letter];
        if (
          current !== "correct" &&
          (status === "correct" || current !== "present")
        ) {
          letterStatuses[letter] = status;
        }
      }

      const gameStatus =
        state.currentGuess === state.answer
          ? "won"
          : board.length >= MAX_CHALLENGES
            ? "lost"
            : state.gameStatus;

      return {
        ...state,
        board,
        currentGuess: "",
        gameStatus,
        letterStatuses,
        errorMessage: "",
      };
    }

    case "reset":
      return {
        answer: action.answer,
        board: [],
        currentGuess: "",
        gameStatus: "playing",
        letterStatuses: {},
        errorMessage: "",
      };
  }
}

function getCell(
  state: WordleState,
  rowIndex: number,
  columnIndex: number,
): CellResult {
  const submitted = state.board[rowIndex];
  if (submitted) {
    return {
      letter: submitted[columnIndex].letter.toUpperCase(),
      status: submitted[columnIndex].status,
    };
  }

  if (rowIndex === state.board.length && state.gameStatus === "playing") {
    const letter = (state.currentGuess[columnIndex] ?? "").toUpperCase();
    return { letter, status: letter ? "tbd" : "empty" };
  }

  return { letter: "", status: "empty" };
}

export const useWordle = (options?: UseWordleOptions) => {
  const hasInitialWord = options?.initialWord !== undefined;
  const [state, setState] = createSignal<WordleState>({
    // Keep server and hydration state equal; the client selects a random word on mount.
    answer: options?.initialWord ?? WORDS[0],
    board: [],
    currentGuess: "",
    gameStatus: "playing",
    letterStatuses: {},
    errorMessage: "",
  });

  const dispatch = (action: WordleAction): void => {
    setState((current) => reducer(current, action));
  };
  const addLetter = (letter: string): void =>
    dispatch({ type: "addLetter", letter });
  const removeLetter = (): void => dispatch({ type: "removeLetter" });
  const submit = (): void => dispatch({ type: "submit" });
  const reset = (): void =>
    dispatch({ type: "reset", answer: getRandomWord() });

  onMount(() => {
    if (!hasInitialWord) {
      dispatch({ type: "reset", answer: getRandomWord() });
    }
  });

  const Wordle: Component = () => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const { key, ctrlKey, altKey, metaKey } = event;
      if (ctrlKey || altKey || metaKey) return;
      if (key === "Enter") {
        submit();
      } else if (key === "Backspace") {
        removeLetter();
      } else if (/^[a-zA-Z]$/.test(key)) {
        addLetter(key);
      }
    };

    onMount(() => {
      document.addEventListener("keydown", onKeyDown);
      onCleanup(() => document.removeEventListener("keydown", onKeyDown));
    });

    const onKeyboardClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (
      event,
    ) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>("button[data-key]");
      const key = button?.dataset.key;
      if (!key) return;
      if (key === "Enter") {
        submit();
      } else if (key === "⌫") {
        removeLetter();
      } else {
        addLetter(key);
      }
    };

    return (
      <div class={styles["elm-wordle"]}>
        <div
          class={clsx(
            styles["message-area"],
            state().errorMessage
              ? styles.error
              : state().gameStatus !== "playing"
                ? styles.status
                : undefined,
          )}
          aria-live="polite"
        >
          {state().errorMessage
            ? state().errorMessage
            : state().gameStatus === "won"
              ? `🎉 You won in ${state().board.length} ${state().board.length === 1 ? "guess" : "guesses"}!`
              : state().gameStatus === "lost"
                ? `😢 The word was "${state().answer.toUpperCase()}"`
                : null}
        </div>

        <div class={styles.board}>
          <For each={ROW_INDEXES}>
            {(rowIndex) => (
              <div class={styles.row}>
                <For each={COLUMN_INDEXES}>
                  {(columnIndex) => {
                    const cell = createMemo(() =>
                      getCell(state(), rowIndex, columnIndex),
                    );
                    return (
                      <div class={clsx(styles.cell, styles[cell().status])}>
                        {cell().letter}
                      </div>
                    );
                  }}
                </For>
              </div>
            )}
          </For>
        </div>

        <div class={styles.keyboard} onClick={onKeyboardClick}>
          <For each={KEYBOARD_ROWS}>
            {(row) => (
              <div class={styles["keyboard-row"]}>
                <For each={row}>
                  {(key) => {
                    const keyStatus = createMemo(
                      () => state().letterStatuses[key.toLowerCase()],
                    );
                    return (
                      <button
                        type="button"
                        data-key={key}
                        class={clsx(
                          styles.key,
                          (key === "Enter" || key === "⌫") && styles.wide,
                          keyStatus() && styles[keyStatus()!],
                        )}
                      >
                        {key}
                      </button>
                    );
                  }}
                </For>
              </div>
            )}
          </For>
        </div>

        <div
          class={clsx(
            styles["reset-container"],
            state().gameStatus === "playing" && styles.hidden,
          )}
        >
          <button type="button" class={styles["reset-button"]} onClick={reset}>
            Play Again
          </button>
        </div>
      </div>
    );
  };

  return {
    answer: () => state().answer,
    board: () => state().board,
    currentGuess: () => state().currentGuess,
    gameStatus: () => state().gameStatus,
    letterStatuses: () => state().letterStatuses,
    errorMessage: () => state().errorMessage,
    submit,
    addLetter,
    removeLetter,
    reset,
    Wordle,
  };
};
