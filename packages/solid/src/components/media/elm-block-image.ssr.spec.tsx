import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmBlockImage } from "./elm-block-image";

describe("[SSR] ElmBlockImage", () => {
  it("renders one fallback-free inline image and a closed dialog shell", () => {
    const html = renderToString(() => (
      <ElmBlockImage
        src="https://example.com/image.png"
        alt="Example"
        class="custom-image"
        data-image="block"
      />
    ));

    expect(html).toContain("<figure");
    expect(html).toContain("<dialog");
    expect(html).toContain('src="https://example.com/image.png"');
    expect(html).toContain('alt="Example"');
    expect(html).toContain("custom-image");
    expect(html).toContain('data-image="block"');
    expect(html.match(/<img/g) ?? []).toHaveLength(1);
    expect(html).not.toContain("fallback");
    expect(html).not.toContain("elm-rectangle-wave");
  });

  it("renders caption and responsive image attributes", () => {
    const html = renderToString(() => (
      <ElmBlockImage
        src="small.png"
        srcSet="small.png 400w, large.png 800w"
        sizes="100vw"
        caption="A photo"
      />
    ));

    expect(html).toContain("<figcaption");
    expect(html).toContain("A photo");
    expect(html).toContain('alt="A photo"');
    expect(html).toContain('srcset="small.png 400w, large.png 800w"');
    expect(html).toContain('sizes="100vw"');
  });
});
