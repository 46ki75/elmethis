import { describe, expect, test } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmBlockImage } from "./elm-block-image";

// ElmBlockImage renders a `<figure>` with the inline image, a rectangle-wave
// loading fallback, an optional caption, and a `useModal` lightbox.
//
// The unit layer covers structure and the CLOSED/loading markup: happy-dom
// neither resolves `<img>.decode()` nor fires a real network `load`, so the
// loaded image + click-to-zoom OPEN lifecycle lives in
// `elm-block-image.browser.spec.tsx`.

describe("[CSR] ElmBlockImage — structure", () => {
  test("renders a figure with the inline image pointing at src", () => {
    const wrapper = mount(ElmBlockImage, {
      props: { src: "https://example.com/a.png", alt: "A" },
    });
    expect(wrapper.find("figure").exists()).toBe(true);
    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe("https://example.com/a.png");
    expect(img.attributes("alt")).toBe("A");
  });

  test("renders the rectangle-wave loading fallback", () => {
    const wrapper = mount(ElmBlockImage, {
      props: { src: "https://example.com/a.png" },
    });
    expect(wrapper.find('[class*="fallback"]').exists()).toBe(true);
    expect(wrapper.find('[class*="elm-rectangle-wave"]').exists()).toBe(true);
  });

  test("the lightbox <dialog> shell is present and closed (only the inline image)", () => {
    const wrapper = mount(ElmBlockImage, {
      props: { src: "https://example.com/a.png" },
    });
    const dialog = wrapper.find("dialog").element as HTMLDialogElement;
    expect(dialog).toBeTruthy();
    expect(dialog.open).toBe(false);
    expect(wrapper.findAll("img").length).toBe(1);
  });

  test("merges a passthrough class onto the figure", () => {
    const wrapper = mount(ElmBlockImage, {
      props: { src: "https://example.com/a.png" },
      attrs: { class: "custom-class" },
    });
    expect(wrapper.find("figure").classes()).toContain("custom-class");
  });
});

describe("[CSR] ElmBlockImage — alt fallback", () => {
  test("alt falls back to caption when alt is absent", () => {
    const wrapper = mount(ElmBlockImage, {
      props: { src: "https://example.com/a.png", caption: "A photo" },
    });
    expect(wrapper.find("img").attributes("alt")).toBe("A photo");
  });

  test("alt falls back to 'Image' when neither alt nor caption is given", () => {
    const wrapper = mount(ElmBlockImage, {
      props: { src: "https://example.com/a.png" },
    });
    expect(wrapper.find("img").attributes("alt")).toBe("Image");
  });
});

describe("[CSR] ElmBlockImage — caption", () => {
  test("renders the figcaption when a caption is provided", () => {
    const wrapper = mount(ElmBlockImage, {
      props: { src: "https://example.com/a.png", caption: "A photo" },
    });
    expect(wrapper.find("figcaption").exists()).toBe(true);
    expect(wrapper.find("figcaption").text()).toContain("A photo");
  });

  test("omits the figcaption when no caption is provided", () => {
    const wrapper = mount(ElmBlockImage, {
      props: { src: "https://example.com/a.png" },
    });
    expect(wrapper.find("figcaption").exists()).toBe(false);
  });
});

describe("[SSR] ElmBlockImage", () => {
  test("renders a figure with the inline image pointing at src", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(ElmBlockImage, { src: "https://example.com/a.png", alt: "A" }),
      }),
    );
    const lower = html.toLowerCase();
    expect(lower).toContain("<figure");
    expect(lower).toContain("elm-block-image");
    expect(html).toContain('src="https://example.com/a.png"');
    expect(html).toContain('alt="A"');
  });

  test("the lightbox <dialog> shell is present and closed (no enlarged image)", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () => h(ElmBlockImage, { src: "https://example.com/a.png" }),
        }),
      )
    ).toLowerCase();
    expect(html).toContain("<dialog");
    expect((html.match(/<img/g) ?? []).length).toBe(1);
  });

  test("alt falls back to 'Image' when neither alt nor caption is given", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(ElmBlockImage, { src: "https://example.com/a.png" }),
      }),
    );
    expect(html).toContain('alt="Image"');
  });

  test("renders the figcaption when a caption is provided", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(ElmBlockImage, {
            src: "https://example.com/a.png",
            caption: "A photo",
          }),
      }),
    );
    expect(html.toLowerCase()).toContain("<figcaption");
    expect(html).toContain("A photo");
  });
});
