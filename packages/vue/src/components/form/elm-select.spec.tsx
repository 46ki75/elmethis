import { describe, it, expect } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmSelect } from "./elm-select";

// Option-click selection (clipped collapse list, per-option handlers, real
// layout) lives in elm-select.browser.spec.tsx. The unit layer covers the SSR
// shell: label + placeholder when empty, and the selected option's label when
// controlled.

describe("[SSR] ElmSelect", () => {
  it("renders the label and placeholder when nothing is selected", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(ElmSelect, {
            label: "Pick a model",
            placeholder: "Choose one",
            options: [
              { id: "a", label: "Apple" },
              { id: "b", label: "Banana" },
            ],
          }),
      }),
    );
    expect(html).toContain("Pick a model");
    expect(html).toContain("Choose one");
  });

  it("renders the selected option label when controlled", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(ElmSelect, {
            label: "Pick",
            selectedOptionId: "b",
            options: [
              { id: "a", label: "Apple" },
              { id: "b", label: "Banana" },
            ],
          }),
      }),
    );
    expect(html).toContain("Banana");
  });
});
