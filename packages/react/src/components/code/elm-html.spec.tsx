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

  // BUG: only the two known casings (`srcDoc`, `srcdoc`) are stripped from
  // `rest` — any other casing (e.g. `Srcdoc`) survives the destructure and,
  // spread after the component's own `srcDoc={html}`, silently overrides it.
  // Same defect class as the sandbox-casing bug fixed above; same fix
  // (reposition the component's own assignment after the spread) applies.
  test("a forwarded differently-cased `Srcdoc` cannot silently override the intended `html` either", () => {
    const props = {
      html: "<p>trusted</p>",
      Srcdoc: "<p>injected</p>",
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
    const tokens = iframe.getAttribute("sandbox")?.toLowerCase().split(/\s+/);

    expect(tokens).toContain("allow-scripts");
    expect(tokens).not.toContain("allow-same-origin");
  });

  // BUG: the strip above only runs inside `if (autoHeight)` — with
  // `autoHeight={false}`, none of the strip logic executes at all, so a
  // caller-supplied "allow-scripts allow-same-origin" sandbox passes straight
  // through unmodified, recreating the exact escape combo this component
  // exists to prevent, just reached via a different (equally supported) prop
  // combination.
  test("strips a caller-supplied allow-same-origin even when autoHeight is off", () => {
    const { container } = render(
      <ElmHtml
        html="<p>x</p>"
        autoHeight={false}
        sandbox="allow-scripts allow-same-origin"
      />,
    );
    const iframe = container.querySelector("iframe")!;
    const tokens = iframe.getAttribute("sandbox")?.toLowerCase().split(/\s+/);

    expect(tokens).toContain("allow-scripts");
    expect(tokens).not.toContain("allow-same-origin");
  });

  // BUG: a differently-cased `Sandbox` key smuggled in via a loosely-typed
  // props bag isn't captured by the `sandbox` destructure (an exact-key
  // match), so it flows into `...safeRest`, which is spread after the
  // component's own `sandbox={effectiveSandbox}` in the JSX. `setAttribute`
  // lowercases attribute names for HTML elements, so both keys resolve to
  // the same `sandbox` DOM attribute — and since the smuggled key is applied
  // later, it silently overwrites the sanitized value, recreating the exact
  // escape this component exists to prevent.
  test("a differently-cased `Sandbox` prop cannot override the sanitized sandbox", () => {
    const props = {
      html: "<p>x</p>",
      sandbox: "allow-forms",
      Sandbox: "allow-scripts allow-same-origin",
    } as unknown as ElmHtmlProps;
    const { container } = render(<ElmHtml {...props} />);
    const iframe = container.querySelector("iframe")!;
    const tokens = iframe.getAttribute("sandbox")?.toLowerCase().split(/\s+/);

    expect(tokens).not.toContain("allow-scripts");
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

  test("allowScripts adds allow-scripts to the sandbox", () => {
    const { container } = render(
      <ElmHtml html="<p>x</p>" allowScripts={true} />,
    );
    const iframe = container.querySelector("iframe")!;

    expect(iframe.getAttribute("sandbox")?.split(/\s+/)).toContain(
      "allow-scripts",
    );
  });

  test("does not add allow-scripts when allowScripts is unset", () => {
    const { container } = render(<ElmHtml html="<p>x</p>" />);
    const iframe = container.querySelector("iframe")!;

    expect(iframe.getAttribute("sandbox")?.split(/\s+/)).not.toContain(
      "allow-scripts",
    );
  });

  test("allowScripts still strips allow-same-origin even with autoHeight on", () => {
    const { container } = render(
      <ElmHtml html="<p>x</p>" allowScripts={true} autoHeight={true} />,
    );
    const iframe = container.querySelector("iframe")!;
    const tokens = iframe.getAttribute("sandbox")?.split(/\s+/);

    expect(tokens).toContain("allow-scripts");
    expect(tokens).not.toContain("allow-same-origin");
  });
});

// happy-dom (this file's unit-layer environment) simulates real navigation
// for an iframe's `src` — including an actual outbound `fetch()` — unlike
// srcdoc, which it renders locally. A real `https://` value here would make
// these "unit" tests silently depend on network reachability, so a `data:`
// URI stands in for "some remote src value" throughout: it exercises the
// exact same attribute-level code path without leaving the process.
const REMOTE_SRC = "data:text/html,<p>remote</p>";
const REMOTE_SRC_WITH_TOKEN = "data:text/html,<p>remote</p>?token=secret";

describe("[CSR] ElmHtml — remote src", () => {
  test("renders the iframe's src attribute and omits srcdoc", () => {
    const { container } = render(<ElmHtml src={REMOTE_SRC} />);
    const iframe = container.querySelector("iframe")!;

    expect(iframe.getAttribute("src")).toBe(REMOTE_SRC);
    expect(iframe.hasAttribute("srcdoc")).toBe(false);
  });

  test("html mode omits the src attribute", () => {
    const { container } = render(<ElmHtml html="<p>hi</p>" />);
    const iframe = container.querySelector("iframe")!;

    expect(iframe.hasAttribute("src")).toBe(false);
    expect(iframe.getAttribute("srcdoc")).toBe("<p>hi</p>");
  });

  test("src wins when both html and src are supplied", () => {
    const props = {
      html: "<p>trusted</p>",
      src: REMOTE_SRC,
    } as unknown as ElmHtmlProps;
    const { container } = render(<ElmHtml {...props} />);
    const iframe = container.querySelector("iframe")!;

    expect(iframe.getAttribute("src")).toBe(REMOTE_SRC);
    expect(iframe.hasAttribute("srcdoc")).toBe(false);
  });

  test("forces referrerPolicy=no-referrer so a presigned URL's query string can't leak via Referer", () => {
    const { container } = render(<ElmHtml src={REMOTE_SRC_WITH_TOKEN} />);
    const iframe = container.querySelector("iframe")!;

    expect(iframe.getAttribute("referrerpolicy")).toBe("no-referrer");
  });

  // BUG-shaped regression: a differently-cased `referrerpolicy` (matching the
  // HTML attribute spelling rather than the `referrerPolicy` prop name)
  // smuggled through a loosely-typed props bag must not be able to weaken
  // the no-referrer hardening — same defect class as the Sandbox/Srcdoc
  // casing bugs above.
  test("a smuggled differently-cased referrerpolicy cannot override the forced no-referrer", () => {
    const props = {
      src: REMOTE_SRC_WITH_TOKEN,
      referrerpolicy: "unsafe-url",
    } as unknown as ElmHtmlProps;
    const { container } = render(<ElmHtml {...props} />);
    const iframe = container.querySelector("iframe")!;

    expect(iframe.getAttribute("referrerpolicy")).toBe("no-referrer");
  });

  test("does not force referrerPolicy for html mode", () => {
    const { container } = render(<ElmHtml html="<p>hi</p>" />);
    const iframe = container.querySelector("iframe")!;

    expect(iframe.hasAttribute("referrerpolicy")).toBe(false);
  });

  // Corrected behavior: `src` mode is no longer special-cased out of
  // `allow-same-origin`. A `src` URL can be same-origin (or otherwise get
  // `allow-same-origin` treatment, e.g. a `blob:` URL created by this same
  // window), in which case granting this is genuinely useful for
  // `autoHeight`'s measurement; a truly cross-origin `src` just won't
  // benefit, but doesn't lose anything either (see `ElmHtmlProps.src`'s doc
  // comment).
  test("adds allow-same-origin for src content when autoHeight is on and no allow-scripts", () => {
    const { container } = render(
      <ElmHtml src={REMOTE_SRC} autoHeight={true} />,
    );
    const iframe = container.querySelector("iframe")!;

    expect(iframe.getAttribute("sandbox")?.split(/\s+/)).toContain(
      "allow-same-origin",
    );
  });

  test("still never adds allow-same-origin for src content when allowScripts is on", () => {
    const { container } = render(
      <ElmHtml src={REMOTE_SRC} autoHeight={true} allowScripts={true} />,
    );
    const iframe = container.querySelector("iframe")!;

    expect(iframe.getAttribute("sandbox")?.split(/\s+/)).not.toContain(
      "allow-same-origin",
    );
  });
});
