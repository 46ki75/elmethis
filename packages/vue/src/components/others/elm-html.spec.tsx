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
