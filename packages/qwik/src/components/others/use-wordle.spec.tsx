import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { component$ } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import { useWordle } from "./use-wordle";

// ---------------------------------------------------------------------------
// Wrapper components that use the hook inside component$
// ---------------------------------------------------------------------------
const WordleWrapper = component$(() => {
  const { Wordle } = useWordle({ initialWord: "which" });
  return <Wordle />;
});

const WordleBoardWrapper = component$(() => {
  const { Wordle } = useWordle({ initialWord: "world" });
  return <Wordle />;
});

// ---------------------------------------------------------------------------
// [CSR]
// ---------------------------------------------------------------------------
describe("[CSR]", () => {
  test("should render the board and keyboard", async () => {
    const { screen, render } = await createDOM();
    await render(<WordleWrapper />);

    // Keyboard letters should be present
    expect(screen.outerHTML).toContain("Q");
    expect(screen.outerHTML).toContain("W");
    expect(screen.outerHTML).toContain("E");
    expect(screen.outerHTML).toContain("R");
    expect(screen.outerHTML).toContain("T");
    expect(screen.outerHTML).toContain("Enter");
  });

  test("should render with a different initial word", async () => {
    const { screen, render } = await createDOM();
    await render(<WordleBoardWrapper />);

    expect(screen.outerHTML).toContain("Q");
    expect(screen.outerHTML).toContain("Enter");
  });

  test("should render the backspace key", async () => {
    const { screen, render } = await createDOM();
    await render(<WordleWrapper />);
    expect(screen.outerHTML).toContain("⌫");
  });
});

// ---------------------------------------------------------------------------
// [SSR]
// ---------------------------------------------------------------------------
describe("[SSR]", () => {
  test("should render the board and keyboard", async () => {
    const renderResult = await renderToString(<WordleWrapper />, {
      containerTagName: "div",
      symbolMapper: (symbolName, _mapper, parent) => [
        symbolName,
        parent ?? symbolName,
      ],
    });

    expect(renderResult.html).toContain("Q");
    expect(renderResult.html).toContain("W");
    expect(renderResult.html).toContain("E");
    expect(renderResult.html).toContain("Enter");
    expect(renderResult.html).toContain("⌫");
  });
});
