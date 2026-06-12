import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmModal } from "./elm-modal";

// `<dialog>.showModal()` is exercised in a real browser, so the unit layer
// only covers the CLOSED state and state-independent markup. The open
// lifecycle (showModal, top layer, fade, close timer) is in
// elm-modal.browser.spec.tsx.

describe("[CSR]", () => {
  test("Should render closed dialog with content", () => {
    const { container } = render(
      <ElmModal isOpen={false}>
        <span>Modal body</span>
      </ElmModal>,
    );
    expect(container.innerHTML).toContain("Modal body");
    // Initially-closed modal never armed showModal(), so it carries no `shown`.
    expect(container.querySelector("dialog")).not.toHaveClass("shown");
  });

  test("Should render a dialog element", () => {
    const { container } = render(
      <ElmModal>
        <span>Body</span>
      </ElmModal>,
    );
    expect(container.querySelector("dialog")).toBeTruthy();
  });

  // The fade delay is emitted as a scoped custom property so the CSS transition
  // stays in lockstep with the JS close timer.
  test("Should emit the delay as a scoped custom property", () => {
    const { container } = render(
      <ElmModal delay={500}>
        <span>Body</span>
      </ElmModal>,
    );
    const dialog = container.querySelector("dialog")!;
    expect(dialog.style.getPropertyValue("--elmethis-scoped-modal-delay")).toBe(
      "500ms",
    );
  });

  test("Should default the delay to 200ms", () => {
    const { container } = render(
      <ElmModal>
        <span>Body</span>
      </ElmModal>,
    );
    const dialog = container.querySelector("dialog")!;
    expect(dialog.style.getPropertyValue("--elmethis-scoped-modal-delay")).toBe(
      "200ms",
    );
  });

  test("Should merge a passthrough className onto the root", () => {
    const { container } = render(
      <ElmModal className="custom-class">
        <span>Body</span>
      </ElmModal>,
    );
    expect(container.querySelector("dialog")).toHaveClass("custom-class");
  });
});

describe("[SSR]", () => {
  test("Should render the dialog and content on the server", () => {
    const html = renderToStaticMarkup(
      <ElmModal isOpen={false}>
        <span>Modal body</span>
      </ElmModal>,
    );
    expect(html).toContain("Modal body");
    expect(html).toContain("<dialog");
  });
});
