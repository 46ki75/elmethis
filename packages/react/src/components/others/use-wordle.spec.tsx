import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { useWordle } from "./use-wordle";

// ---------------------------------------------------------------------------
// Wrapper components that use the hook inside a function component
// ---------------------------------------------------------------------------
const WordleWrapper = () => {
  const { Wordle } = useWordle({ initialWord: "which" });
  return <Wordle />;
};

const WordleBoardWrapper = () => {
  const { Wordle } = useWordle({ initialWord: "world" });
  return <Wordle />;
};

// ---------------------------------------------------------------------------
// [CSR]
// ---------------------------------------------------------------------------
describe("[CSR] useWordle", () => {
  test("should render the board and keyboard", () => {
    const { container } = render(<WordleWrapper />);

    const html = container.innerHTML;
    expect(html).toContain("Q");
    expect(html).toContain("W");
    expect(html).toContain("E");
    expect(html).toContain("R");
    expect(html).toContain("T");
    expect(html).toContain("Enter");
  });

  test("should render with a different initial word", () => {
    const { container } = render(<WordleBoardWrapper />);

    const html = container.innerHTML;
    expect(html).toContain("Q");
    expect(html).toContain("Enter");
  });

  test("should render the backspace key", () => {
    const { container } = render(<WordleWrapper />);
    expect(container.innerHTML).toContain("⌫");
  });
});

// ---------------------------------------------------------------------------
// [SSR]
// ---------------------------------------------------------------------------
describe("[SSR] useWordle", () => {
  test("should render the board and keyboard", () => {
    const html = renderToStaticMarkup(<WordleWrapper />);

    expect(html).toContain("Q");
    expect(html).toContain("W");
    expect(html).toContain("E");
    expect(html).toContain("Enter");
    expect(html).toContain("⌫");
  });
});
