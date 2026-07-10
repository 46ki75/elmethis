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

  // BUG: only the known casings (`src`, `srcDoc`, `srcdoc`) are stripped from
  // `attrs` — any other casing (e.g. `Srcdoc`) survives and, spread after the
  // component's own `srcdoc={props.html}`, silently overrides it. Same
  // defect class as the sandbox-casing bug fixed above; same fix (reposition
  // the component's own assignment after the spread) applies.
  test("a forwarded differently-cased `Srcdoc` cannot silently override the intended `html` either", () => {
    const wrapper = mount(ElmHtml, {
      props: { html: "<p>trusted</p>" },
      attrs: { Srcdoc: "<p>injected</p>" },
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
    const tokens = iframe.attributes("sandbox")?.toLowerCase().split(/\s+/);

    expect(tokens).toContain("allow-scripts");
    expect(tokens).not.toContain("allow-same-origin");
  });

  // BUG: the strip above only runs inside `if (props.autoHeight)` — with
  // `autoHeight: false`, none of the strip logic executes at all, so a
  // caller-supplied "allow-scripts allow-same-origin" sandbox passes straight
  // through unmodified, recreating the exact escape combo this component
  // exists to prevent, just reached via a different (equally supported) prop
  // combination.
  test("strips a caller-supplied allow-same-origin even when autoHeight is off", () => {
    const wrapper = mount(ElmHtml, {
      props: {
        html: "<p>x</p>",
        autoHeight: false,
        sandbox: "allow-scripts allow-same-origin",
      },
    });
    const iframe = wrapper.find("iframe");
    const tokens = iframe.attributes("sandbox")?.toLowerCase().split(/\s+/);

    expect(tokens).toContain("allow-scripts");
    expect(tokens).not.toContain("allow-same-origin");
  });

  // BUG: a differently-cased `Sandbox` key smuggled in via `attrs` isn't
  // captured by the declared `sandbox` prop (an exact-key match under Vue's
  // prop resolution), so it lands in `context.attrs` (since
  // `inheritAttrs: false`), which is spread after the component's own
  // `sandbox={effectiveSandbox}` in the JSX. `setAttribute` lowercases
  // attribute names for HTML elements, so both keys resolve to the same
  // `sandbox` DOM attribute — and since the smuggled key is applied later,
  // it silently overwrites the sanitized value, recreating the exact escape
  // this component exists to prevent.
  test("a differently-cased `Sandbox` attr cannot override the sanitized sandbox", () => {
    const wrapper = mount(ElmHtml, {
      props: { html: "<p>x</p>", sandbox: "allow-forms" },
      attrs: { Sandbox: "allow-scripts allow-same-origin" },
    });
    const iframe = wrapper.find("iframe");
    const tokens = iframe.attributes("sandbox")?.toLowerCase().split(/\s+/);

    expect(tokens).not.toContain("allow-scripts");
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

  test("allowScripts adds allow-scripts to the sandbox", () => {
    const wrapper = mount(ElmHtml, {
      props: { html: "<p>x</p>", allowScripts: true },
    });
    const iframe = wrapper.find("iframe");

    expect(iframe.attributes("sandbox")?.split(/\s+/)).toContain(
      "allow-scripts",
    );
  });

  test("does not add allow-scripts when allowScripts is unset", () => {
    const wrapper = mount(ElmHtml, { props: { html: "<p>x</p>" } });
    const iframe = wrapper.find("iframe");

    expect(iframe.attributes("sandbox")?.split(/\s+/)).not.toContain(
      "allow-scripts",
    );
  });

  test("allowScripts still strips allow-same-origin even with autoHeight on", () => {
    const wrapper = mount(ElmHtml, {
      props: { html: "<p>x</p>", allowScripts: true, autoHeight: true },
    });
    const iframe = wrapper.find("iframe");
    const tokens = iframe.attributes("sandbox")?.split(/\s+/);

    expect(tokens).toContain("allow-scripts");
    expect(tokens).not.toContain("allow-same-origin");
  });
});

// happy-dom (this file's unit-layer environment, via @vue/test-utils) also
// simulates real navigation for an iframe's `src` — including an actual
// outbound `fetch()` — unlike srcdoc, which it renders locally. A `data:`
// URI stands in for "some remote src value" throughout: it exercises the
// exact same attribute-level code path without leaving the process.
const REMOTE_SRC = "data:text/html,<p>remote</p>";
const REMOTE_SRC_WITH_TOKEN = "data:text/html,<p>remote</p>?token=secret";

describe("[CSR] ElmHtml — remote src", () => {
  test("renders the iframe's src attribute and omits srcdoc", () => {
    const wrapper = mount(ElmHtml, { props: { src: REMOTE_SRC } });
    const iframe = wrapper.find("iframe");

    expect(iframe.attributes("src")).toBe(REMOTE_SRC);
    expect(iframe.attributes("srcdoc")).toBeUndefined();
  });

  test("html mode omits the src attribute", () => {
    const wrapper = mount(ElmHtml, { props: { html: "<p>hi</p>" } });
    const iframe = wrapper.find("iframe");

    expect(iframe.attributes("src")).toBeUndefined();
    expect(iframe.attributes("srcdoc")).toBe("<p>hi</p>");
  });

  test("src wins when both html and src are supplied", () => {
    const wrapper = mount(ElmHtml, {
      props: { html: "<p>trusted</p>", src: REMOTE_SRC },
    });
    const iframe = wrapper.find("iframe");

    expect(iframe.attributes("src")).toBe(REMOTE_SRC);
    expect(iframe.attributes("srcdoc")).toBeUndefined();
  });

  test("forces referrerpolicy=no-referrer so a presigned URL's query string can't leak via Referer", () => {
    const wrapper = mount(ElmHtml, {
      props: { src: REMOTE_SRC_WITH_TOKEN },
    });
    const iframe = wrapper.find("iframe");

    expect(iframe.attributes("referrerpolicy")).toBe("no-referrer");
  });

  // BUG-shaped regression: a differently-cased `referrerPolicy` smuggled
  // through `attrs` must not be able to weaken the no-referrer hardening —
  // same defect class as the Sandbox/Srcdoc casing bugs above.
  test("a smuggled differently-cased referrerPolicy cannot override the forced no-referrer", () => {
    const wrapper = mount(ElmHtml, {
      props: { src: REMOTE_SRC_WITH_TOKEN },
      attrs: { referrerPolicy: "unsafe-url" },
    });
    const iframe = wrapper.find("iframe");

    expect(iframe.attributes("referrerpolicy")).toBe("no-referrer");
  });

  test("does not force referrerpolicy for html mode", () => {
    const wrapper = mount(ElmHtml, { props: { html: "<p>hi</p>" } });
    const iframe = wrapper.find("iframe");

    expect(iframe.attributes("referrerpolicy")).toBeUndefined();
  });

  test("never adds allow-same-origin for src content, even with autoHeight on and no allow-scripts", () => {
    const wrapper = mount(ElmHtml, {
      props: { src: REMOTE_SRC, autoHeight: true },
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

  // BUG: `parseStyleString` splits declarations on every `;` with no regard
  // for nesting, so a value that legitimately contains a `;` (e.g. a data
  // URI's MIME parameter) gets truncated mid-value at the first one — the
  // fragment before it has no `:` and is silently dropped, and the fragment
  // after it is a malformed dangling remainder.
  test("does not drop a declaration whose value contains a semicolon (e.g. a data URI)", () => {
    const wrapper = mount(ElmHtml, {
      props: { html: "<p>x</p>" },
      attrs: {
        style:
          "background-image: url(data:image/png;base64,AAAA); border: 1px solid red;",
      },
    });
    const iframe = wrapper.find("iframe");

    expect(iframe.element.style.backgroundImage).toContain(
      "data:image/png;base64,AAAA",
    );
    expect(iframe.element.style.border).toContain("red");
  });

  // BUG: `splitDeclarations` tracks paren depth but not quote state, so a
  // `;` inside a quoted value (legal CSS, e.g. `content: 'a;b'`) is treated
  // as a declaration separator — truncating the quoted value mid-string and
  // dropping/mangling the declarations around it.
  test("does not split a declaration on a semicolon inside a quoted value", () => {
    const wrapper = mount(ElmHtml, {
      props: { html: "<p>x</p>" },
      attrs: {
        style: "content: 'a;b'; color: red;",
      },
    });
    const iframe = wrapper.find("iframe");

    expect(iframe.element.style.getPropertyValue("content")).toContain("a;b");
    expect(iframe.element.style.color).toBe("red");
  });

  // BUG: same root cause as above, worse blast radius — an unmatched `(`
  // inside a quoted value (e.g. `content: '(';`) permanently inflates
  // `depth`, since the matching `)` is never seen (it's plain text inside
  // the string, not a real paren). Every subsequent `;` for the rest of the
  // style string is then treated as still "inside parens", swallowing all
  // later declarations into one malformed value instead of just the one
  // containing the quote.
  test("does not let an unmatched paren inside a quoted value swallow the rest of the style string", () => {
    const wrapper = mount(ElmHtml, {
      props: { html: "<p>x</p>" },
      attrs: {
        style: "content: '('; color: red; border: 1px solid blue;",
      },
    });
    const iframe = wrapper.find("iframe");

    expect(iframe.element.style.color).toBe("red");
    expect(iframe.element.style.border).toContain("blue");
  });

  // BUG: the kebab-to-camel conversion (`property.replace(/-([a-z])/g, ...)`)
  // doesn't special-case a leading `--`, so a CSS custom property like
  // `--my-radius` gets mangled into the invalid key `-MyRadius` instead of
  // being left alone — silently losing any caller theming done via CSS
  // variables in a string-form `style`.
  test("does not mangle a leading -- custom property", () => {
    const wrapper = mount(ElmHtml, {
      props: { html: "<p>x</p>" },
      attrs: {
        style: "--my-radius: 8px; border-radius: var(--my-radius);",
      },
    });
    const iframe = wrapper.find("iframe");

    expect(iframe.element.style.getPropertyValue("--my-radius").trim()).toBe(
      "8px",
    );
  });
});
