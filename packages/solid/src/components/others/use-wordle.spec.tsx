import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal, Show, type Setter } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import styles from "./use-wordle.module.css";
import { useWordle } from "./use-wordle";
import { WORDS } from "./wordle/wordlist";

describe("[CSR] useWordle", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders six rows, the keyboard, and non-submitting controls", () => {
    const Harness = () => {
      const { Wordle } = useWordle({ initialWord: "which" });
      return <Wordle />;
    };
    const rendered = render(() => <Harness />);

    expect(rendered.container.querySelectorAll(`.${styles.row}`)).toHaveLength(
      6,
    );
    expect(rendered.container.querySelectorAll(`.${styles.cell}`)).toHaveLength(
      30,
    );
    expect(rendered.getByRole("button", { name: "Enter" })).toHaveAttribute(
      "type",
      "button",
    );
    expect(rendered.getByRole("button", { name: "⌫" })).toHaveAttribute(
      "type",
      "button",
    );
    expect(
      rendered.getByRole("button", { name: "Play Again" }),
    ).toHaveAttribute("type", "button");
  });

  it("keeps the component stable and evaluates repeated letters immutably", () => {
    let game!: ReturnType<typeof useWordle>;
    const Harness = () => {
      game = useWordle({ initialWord: "which" });
      const Wordle = game.Wordle;
      return <Wordle />;
    };
    render(() => <Harness />);
    const Wordle = game.Wordle;
    const initialBoard = game.board();

    for (const letter of "civic") game.addLetter(letter);
    game.submit();

    expect(game.Wordle).toBe(Wordle);
    expect(initialBoard).toEqual([]);
    expect(game.board()).not.toBe(initialBoard);
    expect(game.board()[0]).toEqual([
      { letter: "c", status: "present" },
      { letter: "i", status: "present" },
      { letter: "v", status: "absent" },
      { letter: "i", status: "absent" },
      { letter: "c", status: "absent" },
    ]);
    expect(game.letterStatuses()).toMatchObject({
      c: "present",
      i: "present",
      v: "absent",
    });
  });

  it("selects an unfixed answer only after mounting on the client", () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);
    let game!: ReturnType<typeof useWordle>;
    const Harness = () => {
      game = useWordle();
      return <output>{game.answer()}</output>;
    };

    render(() => <Harness />);

    expect(random).toHaveBeenCalledOnce();
    expect(game.answer()).toBe(WORDS[Math.floor(WORDS.length / 2)]);
  });

  it("preserves validation, winning, and the six-guess loss limit", () => {
    let winningGame!: ReturnType<typeof useWordle>;
    const WinningHarness = () => {
      winningGame = useWordle({ initialWord: "crane" });
      return <output>{winningGame.errorMessage()}</output>;
    };
    render(() => <WinningHarness />);

    winningGame.submit();
    expect(winningGame.errorMessage()).toBe("Not enough letters");
    for (const letter of "zzzzz") winningGame.addLetter(letter);
    winningGame.submit();
    expect(winningGame.errorMessage()).toBe("Not in word list");
    for (let index = 0; index < 5; index++) winningGame.removeLetter();
    for (const letter of "crane") winningGame.addLetter(letter);
    winningGame.submit();
    expect(winningGame.gameStatus()).toBe("won");
    expect(winningGame.board()).toHaveLength(1);
    winningGame.addLetter("x");
    expect(winningGame.currentGuess()).toBe("");

    let losingGame!: ReturnType<typeof useWordle>;
    const LosingHarness = () => {
      losingGame = useWordle({ initialWord: "which" });
      return null;
    };
    render(() => <LosingHarness />);
    for (const guess of [
      "world",
      "there",
      "about",
      "could",
      "write",
      "first",
    ]) {
      for (const letter of guess) losingGame.addLetter(letter);
      losingGame.submit();
    }
    expect(losingGame.gameStatus()).toBe("lost");
    expect(losingGame.board()).toHaveLength(6);
  });

  it("owns the document listener only while Wordle is rendered and cleans it up", () => {
    const addEventListener = vi.spyOn(document, "addEventListener");
    const removeEventListener = vi.spyOn(document, "removeEventListener");
    let game!: ReturnType<typeof useWordle>;
    let setVisible!: Setter<boolean>;
    const Harness = () => {
      const [visible, setIsVisible] = createSignal(false);
      setVisible = setIsVisible;
      game = useWordle({ initialWord: "which" });
      const Wordle = game.Wordle;
      return (
        <>
          <Show when={visible()}>
            <Wordle />
          </Show>
          <output>{game.currentGuess()}</output>
        </>
      );
    };
    render(() => <Harness />);

    fireEvent.keyDown(document, { key: "A" });
    expect(game.currentGuess()).toBe("");

    setVisible(true);
    const keydownListener = addEventListener.mock.calls.find(
      ([type]) => type === "keydown",
    )?.[1];
    expect(keydownListener).toEqual(expect.any(Function));
    fireEvent.keyDown(document, { key: "A" });
    fireEvent.keyDown(document, { key: "B", ctrlKey: true });
    expect(game.currentGuess()).toBe("a");

    setVisible(false);
    expect(removeEventListener).toHaveBeenCalledWith(
      "keydown",
      keydownListener,
    );
    fireEvent.keyDown(document, { key: "B" });
    expect(game.currentGuess()).toBe("a");
  });
});
