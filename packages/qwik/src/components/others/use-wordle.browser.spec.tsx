import { component$ } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { expect, test } from "vitest";

import { useWordle } from "./use-wordle";

// `useWordle` is a hook, so it has to be exercised through a host component.
// The hidden `<output>`s surface internal state for assertions without
// reaching into component internals.
const Harness = component$(() => {
  const { Wordle, currentGuess, gameStatus } = useWordle({
    initialWord: "crane",
  });
  return (
    <div>
      <Wordle />
      <output data-testid="guess">{currentGuess.value}</output>
      <output data-testid="status">{gameStatus.value}</output>
    </div>
  );
});

// CSR — this is the layer that catches the QRL-in-iteration bug. The keyboard
// keys only respond if their click handler resolves in the real optimizer,
// which happy-dom/createDOM cannot verify.
test("keyboard clicks build a guess and submit wins the game", async () => {
  const screen = await render(<Harness />);

  for (const key of ["C", "R", "A", "N", "E"]) {
    await screen.getByRole("button", { name: key, exact: true }).click();
  }
  await expect.element(screen.getByTestId("guess")).toHaveTextContent("crane");

  await screen.getByRole("button", { name: "Enter", exact: true }).click();
  await expect.element(screen.getByText(/You won/)).toBeVisible();
});

// SSR is covered in the unit layer (`use-wordle.spec.tsx` → [SSR] via
// `renderToString`). Deliberately not exercised here: `renderSSR()` spins up a
// Vite SSR module runner whose file handles aren't released at teardown, which
// hangs the browser run's pool close for 10s. Keep SSR assertions in the unit
// layer where they belong.
