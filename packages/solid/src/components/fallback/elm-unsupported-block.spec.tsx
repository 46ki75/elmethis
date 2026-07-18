import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmUnsupportedBlock } from "./elm-unsupported-block";

describe("[CSR] ElmUnsupportedBlock", () => {
  it("renders its message and forwards native attributes and refs", () => {
    let root: HTMLDivElement | undefined;
    const { getByTestId } = render(() => (
      <ElmUnsupportedBlock
        ref={(element) => {
          root = element;
        }}
        class="custom-unsupported"
        data-testid="unsupported"
        aria-label="Unsupported content"
      />
    ));
    const unsupported = getByTestId("unsupported");

    expect(unsupported).toBe(root);
    expect(unsupported).toHaveClass("custom-unsupported");
    expect(unsupported).toHaveAttribute("aria-label", "Unsupported content");
    expect(unsupported).toHaveTextContent("UNSUPPORTED BLOCK");
    expect(unsupported.querySelector("svg")).toBeInTheDocument();
  });

  it("reactively adds, updates, and removes details", () => {
    const [details, setDetails] = createSignal<string>();
    const { getByTestId } = render(() => (
      <ElmUnsupportedBlock details={details()} data-testid="unsupported" />
    ));
    const unsupported = getByTestId("unsupported");

    expect(unsupported).not.toHaveTextContent("type: mermaid");
    setDetails("type: mermaid");
    expect(unsupported).toHaveTextContent("type: mermaid");
    setDetails("type: video");
    expect(unsupported).toHaveTextContent("type: video");
    setDetails(undefined);
    expect(unsupported).not.toHaveTextContent("type: video");
  });
});
