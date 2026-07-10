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

  // BUG: the strip only removes the key `srcdoc` (lowercase, matching the DOM
  // attribute) — a loosely-typed caller forwarding the camelCase `srcDoc` key
  // instead reaches `...rest` untouched, silently overriding the component's
  // own `srcdoc={html}`.
  test("a forwarded camelCase `srcDoc` cannot silently override the intended `html` either", async () => {
    const props = {
      html: "<p>trusted</p>",
      srcDoc: "<p>injected</p>",
    } as unknown as ElmHtmlProps;
    const iframe = await renderIframe(<ElmHtml {...props} />);

    expect(iframe.getAttribute("srcdoc")).toBe("<p>trusted</p>");
  });

  // BUG: only the two known casings (`srcdoc`, `srcDoc`) are stripped from
  // `rest` — any other casing (e.g. `Srcdoc`) survives the destructure and,
  // spread after the component's own `srcdoc={html}`, silently overrides it.
  // Same defect class as the sandbox-casing bug fixed above; same fix
  // (reposition the component's own assignment after the spread) applies.
  test("a forwarded differently-cased `Srcdoc` cannot silently override the intended `html` either", async () => {
    const props = {
      html: "<p>trusted</p>",
      Srcdoc: "<p>injected</p>",
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

  // BUG: the guard above only prevents this component from ADDING
  // allow-same-origin when allow-scripts is present — it never strips one the
  // caller already supplied alongside allow-scripts. A caller-supplied
  // "allow-scripts allow-same-origin" sandbox therefore passes straight
  // through unmodified, recreating the exact escape combo this component
  // exists to prevent.
  test("strips a caller-supplied allow-same-origin when the caller's sandbox override already allows scripts too", async () => {
    const iframe = await renderIframe(
      <ElmHtml html="<p>x</p>" sandbox="allow-scripts allow-same-origin" />,
    );
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
  test("strips a caller-supplied allow-same-origin even when autoHeight is off", async () => {
    const iframe = await renderIframe(
      <ElmHtml
        html="<p>x</p>"
        autoHeight={false}
        sandbox="allow-scripts allow-same-origin"
      />,
    );
    const tokens = iframe.getAttribute("sandbox")?.toLowerCase().split(/\s+/);

    expect(tokens).toContain("allow-scripts");
    expect(tokens).not.toContain("allow-same-origin");
  });

  // BUG: a differently-cased `Sandbox` key smuggled in via a loosely-typed
  // props bag isn't captured by the `sandbox` destructure (an exact-key
  // match), so it flows into `...rest`, which is spread after the
  // component's own `sandbox={effectiveSandbox}` in the JSX. `setAttribute`
  // lowercases attribute names for HTML elements, so both keys resolve to
  // the same `sandbox` DOM attribute — and since the smuggled key is applied
  // later, it silently overwrites the sanitized value, recreating the exact
  // escape this component exists to prevent.
  test("a differently-cased `Sandbox` prop cannot override the sanitized sandbox", async () => {
    const props = {
      html: "<p>x</p>",
      sandbox: "allow-forms",
      Sandbox: "allow-scripts allow-same-origin",
    } as unknown as ElmHtmlProps;
    const iframe = await renderIframe(<ElmHtml {...props} />);
    const tokens = iframe.getAttribute("sandbox")?.toLowerCase().split(/\s+/);

    expect(tokens).not.toContain("allow-scripts");
  });

  test("does not add allow-same-origin when autoHeight is off", async () => {
    const iframe = await renderIframe(
      <ElmHtml html="<p>x</p>" autoHeight={false} sandbox="allow-forms" />,
    );

    expect(iframe.getAttribute("sandbox")?.split(/\s+/)).not.toContain(
      "allow-same-origin",
    );
  });

  test("allowScripts adds allow-scripts to the sandbox", async () => {
    const iframe = await renderIframe(
      <ElmHtml html="<p>x</p>" allowScripts={true} />,
    );

    expect(iframe.getAttribute("sandbox")?.split(/\s+/)).toContain(
      "allow-scripts",
    );
  });

  test("does not add allow-scripts when allowScripts is unset", async () => {
    const iframe = await renderIframe(<ElmHtml html="<p>x</p>" />);

    expect(iframe.getAttribute("sandbox")?.split(/\s+/)).not.toContain(
      "allow-scripts",
    );
  });

  test("allowScripts still strips allow-same-origin even with autoHeight on", async () => {
    const iframe = await renderIframe(
      <ElmHtml html="<p>x</p>" allowScripts={true} autoHeight={true} />,
    );
    const tokens = iframe.getAttribute("sandbox")?.split(/\s+/);

    expect(tokens).toContain("allow-scripts");
    expect(tokens).not.toContain("allow-same-origin");
  });
});

describe("[CSR] ElmHtml — remote src", () => {
  test("renders the iframe's src attribute and omits srcdoc", async () => {
    const iframe = await renderIframe(
      <ElmHtml src="https://example.com/doc.html" />,
    );

    expect(iframe.getAttribute("src")).toBe("https://example.com/doc.html");
    expect(iframe.hasAttribute("srcdoc")).toBe(false);
  });

  test("html mode omits the src attribute", async () => {
    const iframe = await renderIframe(<ElmHtml html="<p>hi</p>" />);

    expect(iframe.hasAttribute("src")).toBe(false);
    expect(iframe.getAttribute("srcdoc")).toBe("<p>hi</p>");
  });

  test("src wins when both html and src are supplied", async () => {
    const props = {
      html: "<p>trusted</p>",
      src: "https://example.com/doc.html",
    } as unknown as ElmHtmlProps;
    const iframe = await renderIframe(<ElmHtml {...props} />);

    expect(iframe.getAttribute("src")).toBe("https://example.com/doc.html");
    expect(iframe.hasAttribute("srcdoc")).toBe(false);
  });

  test("forces referrerPolicy=no-referrer so a presigned URL's query string can't leak via Referer", async () => {
    const iframe = await renderIframe(
      <ElmHtml src="https://example.com/doc.html?token=secret" />,
    );

    expect(iframe.getAttribute("referrerpolicy")).toBe("no-referrer");
  });

  // BUG-shaped regression: a differently-cased `referrerpolicy` (matching the
  // HTML attribute spelling rather than the `referrerPolicy` IDL name)
  // smuggled through a loosely-typed props bag must not be able to weaken
  // the no-referrer hardening — same defect class as the Sandbox/Srcdoc
  // casing bugs above.
  test("a smuggled differently-cased referrerpolicy cannot override the forced no-referrer", async () => {
    const props = {
      src: "https://example.com/doc.html?token=secret",
      referrerpolicy: "unsafe-url",
    } as unknown as ElmHtmlProps;
    const iframe = await renderIframe(<ElmHtml {...props} />);

    expect(iframe.getAttribute("referrerpolicy")).toBe("no-referrer");
  });

  test("does not force referrerPolicy for html mode", async () => {
    const iframe = await renderIframe(<ElmHtml html="<p>hi</p>" />);

    expect(iframe.hasAttribute("referrerpolicy")).toBe(false);
  });

  // Whether this URL is actually same-origin isn't knowable statically (it
  // could be a relative path to a same-origin static asset, or a genuinely
  // cross-origin link) — granting allow-same-origin here is safe either way
  // (it's only dangerous combined with allow-scripts, which this doesn't
  // request) and lets a same-origin src get measured — see
  // elm-html.browser.spec.tsx's "measures height for a same-origin src" for
  // that positive case; the browser's own cross-origin protection is what
  // keeps a genuinely cross-origin document's contentDocument inaccessible.
  test("adds allow-same-origin for src content too, when autoHeight is on and scripts aren't", async () => {
    const iframe = await renderIframe(
      <ElmHtml src="https://example.com/doc.html" autoHeight={true} />,
    );

    expect(iframe.getAttribute("sandbox")?.split(/\s+/)).toContain(
      "allow-same-origin",
    );
  });

  test("never adds allow-same-origin for src content when scripts are allowed", async () => {
    const iframe = await renderIframe(
      <ElmHtml
        src="https://example.com/doc.html"
        autoHeight={true}
        allowScripts
      />,
    );

    expect(iframe.getAttribute("sandbox")?.split(/\s+/)).not.toContain(
      "allow-same-origin",
    );
  });
});
