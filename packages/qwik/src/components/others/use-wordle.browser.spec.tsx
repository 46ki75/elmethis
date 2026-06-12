import { component$ } from "@qwik.dev/core";
import { render, renderSSR } from "vitest-browser-qwik";
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

// SSR — server HTML is produced without crashing and contains the keyboard.
test("renders the keyboard on the server", async () => {
  const screen = await renderSSR(<Harness />);
  await expect
    .element(screen.getByRole("button", { name: "Enter", exact: true }))
    .toBeInTheDocument();
});
