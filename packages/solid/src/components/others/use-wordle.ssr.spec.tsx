import { renderToString } from "solid-js/web";
import { describe, expect, it, vi } from "vitest";

import { useWordle } from "./use-wordle";

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
    const random = vi.spyOn(Math, "random");

    const html = renderToString(() => {
      const game = useWordle();
      const Wordle = game.Wordle;
      return <Wordle />;
    });

    expect(random).not.toHaveBeenCalled();
    expect(html).toContain("Enter");
  });
});
