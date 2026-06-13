import { describe, expect, test } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { useWordle } from "./use-wordle";

// ---------------------------------------------------------------------------
// Wrapper components that use the hook inside a component setup
// ---------------------------------------------------------------------------
const WordleWrapper = defineComponent({
  name: "WordleWrapper",
  setup() {
    const { Wordle } = useWordle({ initialWord: "which" });
    return () => h(Wordle);
  },
});

const WordleBoardWrapper = defineComponent({
  name: "WordleBoardWrapper",
  setup() {
    const { Wordle } = useWordle({ initialWord: "world" });
    return () => h(Wordle);
  },
});

// ---------------------------------------------------------------------------
// [CSR]
// ---------------------------------------------------------------------------
describe("[CSR] useWordle", () => {
  test("should render the board and keyboard", () => {
    const wrapper = mount(WordleWrapper);

    const html = wrapper.html();
    expect(html).toContain("Q");
    expect(html).toContain("W");
    expect(html).toContain("E");
    expect(html).toContain("R");
    expect(html).toContain("T");
    expect(html).toContain("Enter");
  });

  test("should render with a different initial word", () => {
    const wrapper = mount(WordleBoardWrapper);

    const html = wrapper.html();
    expect(html).toContain("Q");
    expect(html).toContain("Enter");
  });

  test("should render the backspace key", () => {
    const wrapper = mount(WordleWrapper);
    expect(wrapper.html()).toContain("⌫");
  });
});

// ---------------------------------------------------------------------------
// [SSR]
// ---------------------------------------------------------------------------
describe("[SSR] useWordle", () => {
  test("should render the board and keyboard", async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(WordleWrapper) }),
    );

    expect(html).toContain("Q");
    expect(html).toContain("W");
    expect(html).toContain("E");
    expect(html).toContain("Enter");
    expect(html).toContain("⌫");
  });
});
