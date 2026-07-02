import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";

import { ElmHtml, type ElmHtmlProps } from "./elm-html";

// ---------------------------------------------------------------------------
// [CSR]
//
// Reproduces a bug found in code review: while `autoHeight` is at its default
// `true`, the component unconditionally overwrites both the `height` prop and
// `style.height` with the (initially unmeasured) `contentHeight` state — so a
// caller-supplied height is silently dropped instead of being used until the
// real measurement lands. No real iframe navigation is needed to see this:
// it's true of the very first synchronous render, which is why this lives in
// the unit layer rather than *.browser.spec.tsx.
// ---------------------------------------------------------------------------
describe("[CSR] ElmHtml — explicit height while autoHeight is on", () => {
  test("an explicit `height` prop is not silently dropped before measurement completes", () => {
    const { container } = render(<ElmHtml html="<p>hi</p>" height={400} />);
    const iframe = container.querySelector("iframe")!;

    expect(iframe.getAttribute("height") ?? iframe.style.height).toBe("400");
  });

  test("an explicit `style.height` is not silently dropped before measurement completes", () => {
    const { container } = render(
      <ElmHtml html="<p>hi</p>" style={{ height: 400 }} />,
    );
    const iframe = container.querySelector("iframe")!;

    expect(iframe.style.height).toBe("400px");
  });
});

// ---------------------------------------------------------------------------
// [CSR]
//
// Reproduces bugs found in a third code-review round, all visible on the
// synchronous first render — no real iframe navigation needed, so these live
// in the unit layer rather than *.browser.spec.tsx.
// ---------------------------------------------------------------------------
describe("[CSR] ElmHtml — sandboxing correctness", () => {
  // BUG: `src`/`srcDoc` are excluded from `ElmHtmlProps` only at the type
  // level (`Omit<..., "src" | "srcDoc">`); the runtime destructure doesn't
  // strip them, so a `srcDoc` key that reaches `...rest` (e.g. forwarded from
  // a loosely-typed props bag) is spread onto the iframe after the
  // component's own `srcDoc={html}` and silently wins.
  test("a forwarded `srcDoc` cannot silently override the intended `html`", () => {
    const props = {
      html: "<p>trusted</p>",
      srcDoc: "<p>injected</p>",
    } as unknown as ElmHtmlProps;
    const { container } = render(<ElmHtml {...props} />);
    const iframe = container.querySelector("iframe")!;

    expect(iframe.getAttribute("srcdoc")).toBe("<p>trusted</p>");
  });

  // BUG: the strip only removes the key `srcDoc` (camelCase) — the DOM
  // attribute is spelled `srcdoc`, and a loosely-typed caller forwarding that
  // exact lowercase key reaches `...rest` untouched, silently overriding the
  // component's own `srcDoc={html}`.
  test("a forwarded lowercase `srcdoc` cannot silently override the intended `html` either", () => {
    const props = {
      html: "<p>trusted</p>",
      srcdoc: "<p>injected</p>",
    } as unknown as ElmHtmlProps;
    const { container } = render(<ElmHtml {...props} />);
    const iframe = container.querySelector("iframe")!;

    expect(iframe.getAttribute("srcdoc")).toBe("<p>trusted</p>");
  });

  // BUG: the allow-scripts guard does `sandboxTokens.has("allow-scripts")`,
  // a case-sensitive Set lookup — but the HTML `sandbox` attribute matches
  // its keywords case-insensitively, so a differently-cased caller token
  // slips past the guard and still gets `allow-same-origin` force-added,
  // recreating the sandbox-escape the guard exists to prevent.
  test("never adds allow-same-origin when the caller's sandbox override allows scripts, regardless of keyword casing", () => {
    const { container } = render(
      <ElmHtml html="<p>x</p>" sandbox="Allow-Scripts" />,
    );
    const iframe = container.querySelector("iframe")!;

    expect(
      iframe.getAttribute("sandbox")?.toLowerCase().split(/\s+/),
    ).not.toContain("allow-same-origin");
  });

  // BUG: the guard above only prevents this component from ADDING
  // allow-same-origin when allow-scripts is present — it never strips one the
  // caller already supplied alongside allow-scripts. A caller-supplied
  // "allow-scripts allow-same-origin" sandbox therefore passes straight
  // through unmodified, recreating the exact escape combo this component
  // exists to prevent.
  test("strips a caller-supplied allow-same-origin when the caller's sandbox override already allows scripts too", () => {
    const { container } = render(
      <ElmHtml html="<p>x</p>" sandbox="allow-scripts allow-same-origin" />,
    );
    const iframe = container.querySelector("iframe")!;

    expect(
      iframe.getAttribute("sandbox")?.toLowerCase().split(/\s+/),
    ).not.toContain("allow-same-origin");
  });

  // BUG: the allow-same-origin merge runs unconditionally, even when
  // `autoHeight={false}` — the only reason `allow-same-origin` is ever
  // needed (reading `contentDocument` to measure height). With autoHeight
  // off there's no measurement happening, so the extra privilege is pure
  // unwanted exposure with no way for the caller to opt out.
  test("does not add allow-same-origin when autoHeight is off", () => {
    const { container } = render(
      <ElmHtml html="<p>x</p>" autoHeight={false} sandbox="allow-forms" />,
    );
    const iframe = container.querySelector("iframe")!;

    expect(iframe.getAttribute("sandbox")?.split(/\s+/)).not.toContain(
      "allow-same-origin",
    );
  });
});
