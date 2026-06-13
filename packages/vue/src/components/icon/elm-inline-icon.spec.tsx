import { describe, expect, test } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmInlineIcon } from "./elm-inline-icon";

const SRC = "https://example.com/icon.svg";

describe("[CSR] ElmInlineIcon", () => {
  test("renders an <img> with the given src and alt", () => {
    const wrapper = mount(ElmInlineIcon, {
      props: { src: SRC, alt: "my icon" },
    });
    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe(SRC);
    expect(img.attributes("alt")).toBe("my icon");
  });

  test("size prop drives both width and height when neither is set", () => {
    const wrapper = mount(ElmInlineIcon, { props: { src: SRC, size: 24 } });
    const img = wrapper.find("img");
    expect(img.attributes("width")).toBe("24");
    expect(img.attributes("height")).toBe("24");
  });

  test("explicit width / height take precedence over size", () => {
    const wrapper = mount(ElmInlineIcon, {
      props: { src: SRC, size: 24, width: 48, height: 12 },
    });
    const img = wrapper.find("img");
    expect(img.attributes("width")).toBe("48");
    expect(img.attributes("height")).toBe("12");
  });
});

describe("[SSR] ElmInlineIcon", () => {
  test("renders the img shell with src", async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(ElmInlineIcon, { src: SRC }) }),
    );
    expect(html).toContain("<img");
    expect(html).toContain(`src="${SRC}"`);
  });
});
