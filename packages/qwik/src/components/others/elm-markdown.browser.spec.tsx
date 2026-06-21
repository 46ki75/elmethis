import { component$, useSignal } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { describe, expect, test, vi } from "vitest";

import { ElmMarkdown } from "./elm-markdown";

// ElmMarkdown splits the lexed token list into a "stable" prefix (rendered
// through the nested <ElmMarkdownStable> child) and a single trailing "tail"
// block (rendered inline). During streaming it keeps completed blocks stable
// and only repaints the tail. These behaviors live in the browser layer for two
// reasons: (1) the stable prefix renders through a child component$ that
// createDOM does not expand, and (2) the updates are driven by signal changes
// that need real reactivity — exactly the path that hid the empty-bubble
// regression (see elm-ag-ui-message-renderer.browser.spec.tsx).

describe("[CSR] ElmMarkdown — streaming repaint", () => {
  test("the trailing block repaints on every streamed delta", async () => {
    const SingleBlock = component$(() => {
      const md = useSignal("The quick");
      return (
        <div>
          <button
            data-testid="d1"
            onClick$={() => (md.value = "The quick brown")}
          >
            d1
          </button>
          <button
            data-testid="d2"
            onClick$={() => (md.value = "The quick brown fox")}
          >
            d2
          </button>
          <ElmMarkdown markdown={md.value} isStreaming={true} />
        </div>
      );
    });

    const screen = await render(<SingleBlock />);

    await vi.waitFor(() =>
      expect(screen.container.textContent).toContain("The quick"),
    );

    await screen.getByTestId("d1").click();
    await vi.waitFor(() =>
      expect(screen.container.textContent).toContain("brown"),
    );

    await screen.getByTestId("d2").click();
    await vi.waitFor(() =>
      expect(screen.container.textContent).toContain("fox"),
    );
  });

  test("a completed block stays rendered while the next block streams in", async () => {
    const BlockAccretion = component$(() => {
      const md = useSignal("First paragraph stays put");
      return (
        <div>
          <button
            data-testid="grow"
            onClick$={() =>
              (md.value =
                "First paragraph stays put\n\nSecond paragraph arrives")
            }
          >
            grow
          </button>
          <ElmMarkdown markdown={md.value} isStreaming={true} />
        </div>
      );
    });

    const screen = await render(<BlockAccretion />);

    await vi.waitFor(() =>
      expect(screen.container.textContent).toContain(
        "First paragraph stays put",
      ),
    );

    // The first paragraph is promoted from the inline tail into the stable
    // child; both must be visible afterwards.
    await screen.getByTestId("grow").click();
    await vi.waitFor(() =>
      expect(screen.container.textContent).toContain(
        "Second paragraph arrives",
      ),
    );
    expect(screen.container.textContent).toContain("First paragraph stays put");
  });
});

describe("[CSR] ElmMarkdown — non-streaming render", () => {
  test("renders every block through the stable child", async () => {
    const screen = await render(
      <ElmMarkdown markdown={"# Title goes here\n\nBody paragraph follows"} />,
    );

    await vi.waitFor(() => {
      expect(screen.container.textContent).toContain("Title goes here");
      expect(screen.container.textContent).toContain("Body paragraph follows");
    });
  });
});

describe("[CSR] ElmMarkdown — known gate limitation", () => {
  // The stable-block cache is keyed on block COUNT, not content
  // (`newStable.length !== stableTokens.value.length`). A same-count content
  // swap on a *reused* streaming instance therefore leaves the earlier block
  // stale. This is not reachable in append-streaming — completed blocks are
  // frozen and a retry remounts under a new id/key — but it is captured here so
  // that a future gate refactor knows to fix it (this test would then start
  // failing and must be updated).
  test("a same-count content swap leaves the earlier block stale", async () => {
    const Swap = component$(() => {
      const md = useSignal("AAA paragraph\n\nBBB paragraph");
      return (
        <div>
          <button
            data-testid="swap"
            onClick$={() => (md.value = "CCC paragraph\n\nDDD paragraph")}
          >
            swap
          </button>
          <ElmMarkdown markdown={md.value} isStreaming={true} />
        </div>
      );
    });

    const screen = await render(<Swap />);

    await vi.waitFor(() =>
      expect(screen.container.textContent).toContain("AAA paragraph"),
    );

    await screen.getByTestId("swap").click();
    // The tail block refreshes...
    await vi.waitFor(() =>
      expect(screen.container.textContent).toContain("DDD paragraph"),
    );
    // ...but the cached stable block does not: "AAA" lingers, "CCC" never shows.
    expect(screen.container.textContent).toContain("AAA paragraph");
    expect(screen.container.textContent).not.toContain("CCC paragraph");
  });
});
