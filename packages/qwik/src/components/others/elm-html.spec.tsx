import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import type { JSXOutput } from "@qwik.dev/core";

import { ElmHtml, type ElmHtmlProps } from "./elm-html";

// ---------------------------------------------------------------------------
// [CSR]
//
// Mirrors @elmethis/react's ElmHtml unit spec: these all reproduce bugs found
// in code review that are visible on the very first synchronous render — no
// real iframe navigation is needed, so they live in the unit layer (createDOM)
// rather than *.browser.spec.tsx.
// ---------------------------------------------------------------------------

const renderIframe = async (node: JSXOutput) => {
  const { screen, render } = await createDOM();
  await render(node);
  return screen.querySelector("iframe")!;
};

describe("[CSR] ElmHtml — explicit height while autoHeight is on", () => {
  test("an explicit `height` prop is not silently dropped before measurement completes", async () => {
    const iframe = await renderIframe(
      <ElmHtml html="<p>hi</p>" height={400} />,
    );

    expect(iframe.getAttribute("height") ?? iframe.style.height).toBe("400");
  });

  test("an explicit `style.height` is not silently dropped before measurement completes", async () => {
    const iframe = await renderIframe(
      <ElmHtml html="<p>hi</p>" style={{ height: "400px" }} />,
    );

    expect(iframe.style.height).toBe("400px");
  });
});

describe("[CSR] ElmHtml — sandboxing correctness", () => {
  test("a forwarded `srcdoc` cannot silently override the intended `html`", async () => {
    const props = {
      html: "<p>trusted</p>",
      srcdoc: "<p>injected</p>",
    } as unknown as ElmHtmlProps;
    const iframe = await renderIframe(<ElmHtml {...props} />);

    expect(iframe.getAttribute("srcdoc")).toBe("<p>trusted</p>");
  });

  test("never adds allow-same-origin when the caller's sandbox override allows scripts, regardless of keyword casing", async () => {
    const iframe = await renderIframe(
      <ElmHtml html="<p>x</p>" sandbox="Allow-Scripts" />,
    );

    expect(
      iframe.getAttribute("sandbox")?.toLowerCase().split(/\s+/),
    ).not.toContain("allow-same-origin");
  });

  test("does not add allow-same-origin when autoHeight is off", async () => {
    const iframe = await renderIframe(
      <ElmHtml html="<p>x</p>" autoHeight={false} sandbox="allow-forms" />,
    );

    expect(iframe.getAttribute("sandbox")?.split(/\s+/)).not.toContain(
      "allow-same-origin",
    );
  });
});
