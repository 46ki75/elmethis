import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmBookmark } from "./elm-bookmark";

// ElmBookmark renders an external link card: an `<a href>` (new-tab + noopener)
// wrapping an OGP `<img>`, the title/description text, and a link row that shows
// the favicon when supplied or the mdi link icon as a fallback.

describe("[CSR] ElmBookmark", () => {
  it("renders an anchor to url with safe new-tab rel", () => {
    const wrapper = mount(ElmBookmark, {
      props: {
        title: "Example",
        url: "https://example.com",
        description: "An example site",
      },
    });

    const a = wrapper.find("a");
    expect(a.attributes("href")).toBe("https://example.com");
    expect(a.attributes("target")).toBe("_blank");
    expect(a.attributes("rel")).toBe("noopener noreferrer");
    expect(wrapper.text()).toContain("Example");
    expect(wrapper.text()).toContain("An example site");
  });

  it("renders the OGP img with the supplied image src", () => {
    const wrapper = mount(ElmBookmark, {
      props: {
        title: "t",
        url: "https://example.com",
        image: "https://example.com/ogp.png",
      },
    });

    expect(wrapper.find("img").attributes("src")).toBe(
      "https://example.com/ogp.png",
    );
  });

  it("falls back to the mdi link icon when no favicon is given", () => {
    const wrapper = mount(ElmBookmark, {
      props: { title: "t", url: "https://example.com" },
    });

    // No favicon -> the link row renders an ElmMdiIcon <svg>.
    expect(wrapper.find('[class*="link"] svg').exists()).toBe(true);
  });

  it("renders the favicon icon when favicon is provided", () => {
    const wrapper = mount(ElmBookmark, {
      props: {
        title: "t",
        url: "https://example.com",
        favicon: "https://example.com/favicon.ico",
      },
    });

    expect(wrapper.html()).toContain("https://example.com/favicon.ico");
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmBookmark, {
      props: { title: "t", url: "https://example.com" },
      attrs: { class: "custom-class" },
    });
    expect(wrapper.find("div").classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmBookmark", () => {
  it("server HTML emits the anchor and title", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(ElmBookmark, { title: "Example", url: "https://example.com" }),
      }),
    );
    expect(html.toLowerCase()).toContain("<a");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain("Example");
  });
});
