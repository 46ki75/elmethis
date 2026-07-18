import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

import { useWordle } from "./use-wordle";

describe("[Browser] useWordle", () => {
  it("uses the delegated virtual keyboard to build and submit a winning guess", async () => {
    const Harness = () => {
      const game = useWordle({ initialWord: "crane" });
      const Wordle = game.Wordle;
      return (
        <div>
          <Wordle />
          <output data-testid="guess">{game.currentGuess()}</output>
          <output data-testid="status">{game.gameStatus()}</output>
        </div>
      );
    };
    const rendered = render(() => <Harness />);
    const screen = page.elementLocator(rendered.baseElement);

    for (const key of ["C", "R", "A", "N", "E"]) {
      await screen.getByRole("button", { name: key, exact: true }).click();
    }
    await expect
      .element(screen.getByTestId("guess"))
      .toHaveTextContent("crane");

    await screen.getByRole("button", { name: "Enter", exact: true }).click();
    await expect.element(screen.getByTestId("status")).toHaveTextContent("won");
    await expect.element(screen.getByText(/You won/)).toBeVisible();
    await vi.waitFor(() =>
      expect(
        getComputedStyle(rendered.getByRole("button", { name: "C" }))
          .backgroundColor,
      ).toBe("rgb(83, 141, 78)"),
    );
  });

  it("handles physical keys in Chromium and stops after unmount", async () => {
    let game!: ReturnType<typeof useWordle>;
    const Harness = () => {
      game = useWordle({ initialWord: "which" });
      const Wordle = game.Wordle;
      return (
        <div>
          <Wordle />
          <output data-testid="guess">{game.currentGuess()}</output>
        </div>
      );
    };
    const rendered = render(() => <Harness />);
    const screen = page.elementLocator(rendered.baseElement);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "W" }));
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "X", metaKey: true }),
    );
    await expect.element(screen.getByTestId("guess")).toHaveTextContent("w");

    rendered.unmount();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "H" }));
    expect(game.currentGuess()).toBe("w");
  });
});
