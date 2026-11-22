import { renderToString } from "@solidjs/web";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useWordle } from "./use-wordle";
import { WORDS } from "./wordle/wordlist";

afterEach(() => vi.restoreAllMocks());

describe("[SSR] useWordle", () => {
  it("renders a fixed game and exposes initialWord on the server", () => {
    const html = renderToString(() => {
      const game = useWordle({ initialWord: "which" });
      const Wordle = game.Wordle;
      return (
        <div>
          <output>{game.answer()}</output>
          <Wordle />
        </div>
      );
    });

    expect(html).toContain("which");
    expect(html).toContain("Enter");
    expect(html).toContain("⌫");
    expect(html).toContain('type="button"');
  });

  it("does not choose a random answer during server rendering", () => {
    // Solid's server renderer also calls Math.random(), so assert the
    // observable answer rather than counting calls to the global.
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const html = renderToString(() => {
      const game = useWordle();
      const Wordle = game.Wordle;
      return (
        <>
          <output>{game.answer()}</output>
          <Wordle />
        </>
      );
    });

    expect(html).toContain(`<output>${WORDS[0]}</output>`);
    expect(html).toContain("Enter");
  });
});
