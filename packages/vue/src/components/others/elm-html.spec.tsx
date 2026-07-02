import { describe, expect, test } from "vitest";
import { mount } from "@vue/test-utils";

import { ElmHtml } from "./elm-html";

// ---------------------------------------------------------------------------
// [CSR]
//
// Mirrors a bug found in code review on the react sibling: while `autoHeight`
// is at its default `true`, an earlier version unconditionally overwrote both
// the `height` prop and `style.height` with the (initially unmeasured)
// `contentHeight` state — so a caller-supplied height was silently dropped
// instead of being used until the real measurement lands. No real iframe
// navigation is needed to see this: it's true of the very first synchronous
// render, which is why this lives in the unit layer rather than
// *.browser.spec.tsx.
// ---------------------------------------------------------------------------
describe("[CSR] ElmHtml — explicit height while autoHeight is on", () => {
  test("an explicit `height` prop is not silently dropped before measurement completes", () => {
    const wrapper = mount(ElmHtml, {
      props: { html: "<p>hi</p>", height: 400 },
    });
    const iframe = wrapper.find("iframe");

    expect(iframe.attributes("height") ?? iframe.element.style.height).toBe(
      "400",
    );
  });

  // Unlike react, vue does not auto-append "px" to unitless numeric style
  // values, so a caller-supplied `style.height` is written with units, as is
  // idiomatic in vue (see elm-tooltip.tsx for the same convention elsewhere
  // in this codebase).
  test("an explicit `style.height` is not silently dropped before measurement completes", () => {
    const wrapper = mount(ElmHtml, {
      props: { html: "<p>hi</p>" },
      attrs: { style: { height: "400px" } },
    });
    const iframe = wrapper.find("iframe");

    expect(iframe.element.style.height).toBe("400px");
  });
});

// ---------------------------------------------------------------------------
// [CSR]
//
// Mirrors bugs found in a third code-review round on the react sibling, all
// visible on the synchronous first render — no real iframe navigation
// needed, so these live in the unit layer rather than *.browser.spec.tsx.
// ---------------------------------------------------------------------------
describe("[CSR] ElmHtml — sandboxing correctness", () => {
  // `src`/`srcdoc` are excluded from `ElmHtmlProps` only at the type level; a
  // loosely-typed caller can still smuggle one into `attrs` at runtime, where
  // spreading it last onto the iframe would silently override the
  // component's own `srcdoc={html}`.
  test("a forwarded `srcDoc` cannot silently override the intended `html`", () => {
    const wrapper = mount(ElmHtml, {
      props: { html: "<p>trusted</p>" },
      attrs: { srcDoc: "<p>injected</p>" },
    });
    const iframe = wrapper.find("iframe");

    expect(iframe.attributes("srcdoc")).toBe("<p>trusted</p>");
  });

  // The allow-scripts guard must do a case-insensitive check — the HTML
  // `sandbox` attribute matches its keywords case-insensitively, so a
  // case-sensitive check could be defeated by a differently-cased caller
  // token, recreating the sandbox-escape the guard exists to prevent.
  test("never adds allow-same-origin when the caller's sandbox override allows scripts, regardless of keyword casing", () => {
    const wrapper = mount(ElmHtml, {
      props: { html: "<p>x</p>", sandbox: "Allow-Scripts" },
    });
    const iframe = wrapper.find("iframe");

    expect(
      iframe.attributes("sandbox")?.toLowerCase().split(/\s+/),
    ).not.toContain("allow-same-origin");
  });

  // BUG: the guard above only prevents this component from ADDING
  // allow-same-origin when allow-scripts is present — it never strips one the
  // caller already supplied alongside allow-scripts. A caller-supplied
  // "allow-scripts allow-same-origin" sandbox therefore passes straight
  // through unmodified, recreating the exact escape combo this component
  // exists to prevent.
  test("strips a caller-supplied allow-same-origin when the caller's sandbox override already allows scripts too", () => {
    const wrapper = mount(ElmHtml, {
      props: {
        html: "<p>x</p>",
        sandbox: "allow-scripts allow-same-origin",
      },
    });
    const iframe = wrapper.find("iframe");

    expect(
      iframe.attributes("sandbox")?.toLowerCase().split(/\s+/),
    ).not.toContain("allow-same-origin");
  });

  // The allow-same-origin merge must not run when `autoHeight={false}` — the
  // only reason `allow-same-origin` is ever needed (reading `contentDocument`
  // to measure height). With autoHeight off there's no measurement
  // happening, so the extra privilege would be pure unwanted exposure with no
  // way for the caller to opt out.
  test("does not add allow-same-origin when autoHeight is off", () => {
    const wrapper = mount(ElmHtml, {
      props: { html: "<p>x</p>", autoHeight: false, sandbox: "allow-forms" },
    });
    const iframe = wrapper.find("iframe");

    expect(iframe.attributes("sandbox")?.split(/\s+/)).not.toContain(
      "allow-same-origin",
    );
  });
});

// ---------------------------------------------------------------------------
// [CSR]
//
// `ElmHtmlProps` inherits `style` from vue's `HTMLAttributes`, whose type is
// `string | CSSProperties | Array<StyleValue> | ...` — legal, idiomatic vue
// usage includes a plain string. The component always treats it as a single
// object and spreads it (`{...callerStyle, height: ...}`); spreading a string
// indexes its characters as numeric keys instead of merging properties,
// crashing the render entirely (`patchStyle` then tries to assign a numeric
// index of `CSSStyleDeclaration`, which only has a getter). No real iframe
// navigation is needed to see this: it's true of the very first synchronous
// render, which is why this lives in the unit layer rather than
// *.browser.spec.tsx.
//
// (An array-form `style`, also legal per the type, was checked too but does
// not reproduce: vue normalizes it to a plain object before this component's
// `attrs.style` ever sees it, so only the string form is a confirmed bug.)
// ---------------------------------------------------------------------------
describe("[CSR] ElmHtml — a non-object `style` value while autoHeight is on", () => {
  test("does not corrupt a caller-supplied string `style`", () => {
    const wrapper = mount(ElmHtml, {
      props: { html: "<p>x</p>" },
      attrs: { style: "color: red;" },
    });
    const iframe = wrapper.find("iframe");

    expect(iframe.element.style.color).toBe("red");
  });
});
