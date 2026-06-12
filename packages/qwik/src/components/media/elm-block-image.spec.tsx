import { describe, expect, test } from "vitest";
import { renderToString } from "@qwik.dev/core/server";

import { ElmBlockImage } from "./elm-block-image";

// ElmBlockImage renders a `<figure>` with the inline image, a rectangle-wave
// loading fallback, an optional caption, and a `useModal` lightbox.
//
// This component is SSR-only at the unit layer: its mount `useVisibleTask$`
// calls `imgRef.value.decode()` (Qwik img-onload cookbook) which `createDOM`
// cannot service — the same family of native-`<dialog>`/visible-task limits
// noted in `use-modal.spec.tsx` (see [[feedback_qwik_showmodal_createdom]]).
// SSR renders the initial (loading) markup, which is exactly what we assert
// here; the loaded image + click-to-zoom OPEN lifecycle lives in
// `elm-block-image.browser.spec.tsx`.

const ssr = async (node: Parameters<typeof renderToString>[0]) =>
  (await renderToString(node, { containerTagName: "div" })).html;

describe("[SSR] ElmBlockImage — structure", () => {
  test("renders a figure with the inline image pointing at src", async () => {
    const html = await ssr(
      <ElmBlockImage src="https://example.com/a.png" alt="A" />,
    );
    const lower = html.toLowerCase();
    expect(lower).toContain("<figure");
    expect(lower).toContain("elm-block-image");
    expect(html).toContain('src="https://example.com/a.png"');
    expect(html).toContain('alt="A"');
  });

  test("renders the rectangle-wave loading fallback", async () => {
    const html = await ssr(<ElmBlockImage src="https://example.com/a.png" />);
    expect(html).toContain("fallback");
    expect(html).toContain("elm-rectangle-wave");
  });

  test("the lightbox <dialog> shell is present and closed (no enlarged image)", async () => {
    const html = await ssr(<ElmBlockImage src="https://example.com/a.png" />);
    const lower = html.toLowerCase();
    expect(lower).toContain("<dialog");
    // Closed: `isModalOpen.value` is false so only the inline <img> is rendered
    // (the enlarged modal image is gated behind the open state).
    expect((lower.match(/<img/g) ?? []).length).toBe(1);
  });
});

describe("[SSR] ElmBlockImage — alt fallback", () => {
  test("alt falls back to caption when alt is absent", async () => {
    const html = await ssr(
      <ElmBlockImage src="https://example.com/a.png" caption="A photo" />,
    );
    expect(html).toContain('alt="A photo"');
  });

  test("alt falls back to 'Image' when neither alt nor caption is given", async () => {
    const html = await ssr(<ElmBlockImage src="https://example.com/a.png" />);
    expect(html).toContain('alt="Image"');
  });
});

describe("[SSR] ElmBlockImage — caption", () => {
  test("renders the figcaption when a caption is provided", async () => {
    const html = await ssr(
      <ElmBlockImage src="https://example.com/a.png" caption="A photo" />,
    );
    expect(html.toLowerCase()).toContain("<figcaption");
    expect(html).toContain("A photo");
  });

  test("omits the figcaption when no caption is provided", async () => {
    const html = await ssr(<ElmBlockImage src="https://example.com/a.png" />);
    expect(html.toLowerCase()).not.toContain("<figcaption");
  });
});
