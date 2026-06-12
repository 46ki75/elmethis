import { createDOM } from "@qwik.dev/core/testing";
import { describe, expect, test } from "vitest";

import { ElmModal } from "./elm-modal";
import { renderToString } from "@qwik.dev/core/server";

// `<dialog>.showModal()` throws `_ensureInsertValid` under createDOM, so the
// unit layer only covers the CLOSED state and state-independent markup. The
// open lifecycle (showModal, top layer, fade, close timer) is in
// elm-modal.browser.spec.tsx.

describe("[CSR]", () => {
  test("Should render closed dialog with slot content", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmModal isOpen={false}>
        <span>Modal body</span>
      </ElmModal>,
    );
    expect(screen.outerHTML).toContain("Modal body");
    // Initially-closed modal never armed showModal(), so it carries no `shown`.
    expect(screen.outerHTML).not.toContain("shown");
  });

  test("Should render a dialog element", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmModal>
        <span>Body</span>
      </ElmModal>,
    );
    expect(screen.querySelector("dialog")).toBeTruthy();
  });

  // The fade delay is emitted as a scoped custom property so the CSS transition
  // stays in lockstep with the JS close timer.
  test("Should emit the delay as a scoped custom property", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmModal delay={500}>
        <span>Body</span>
      </ElmModal>,
    );
    expect(screen.outerHTML).toContain("--elmethis-scoped-modal-delay:500ms");
  });

  test("Should default the delay to 200ms", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmModal>
        <span>Body</span>
      </ElmModal>,
    );
    expect(screen.outerHTML).toContain("--elmethis-scoped-modal-delay:200ms");
  });
});

describe("[SSR]", () => {
  test("Should render the dialog and slot content on the server", async () => {
    const renderResult = await renderToString(
      <ElmModal isOpen={false}>
        <span>Modal body</span>
      </ElmModal>,
      { containerTagName: "div" },
    );
    expect(renderResult.html).toContain("Modal body");
    expect(renderResult.html).toContain("<dialog");
  });
});
