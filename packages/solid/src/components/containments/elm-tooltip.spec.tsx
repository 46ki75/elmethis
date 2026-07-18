import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmTooltip } from "./elm-tooltip";

describe("[CSR] ElmTooltip", () => {
  it("renders both contents and composes attributes, class, and ref", () => {
    let root: HTMLSpanElement | undefined;
    const rendered = render(() => (
      <ElmTooltip
        ref={(element) => {
          root = element;
        }}
        class="custom-tooltip"
        data-testid="tooltip-host"
        aria-label="More information"
        original={<span>Trigger</span>}
        tooltip={<span>Tip body</span>}
      />
    ));
    const host = rendered.getByTestId("tooltip-host");

    expect(host).toBe(root);
    expect(host).toHaveClass("custom-tooltip");
    expect(host).toHaveAttribute("aria-label", "More information");
    expect(host).toHaveTextContent("Trigger");
    expect(host).toHaveTextContent("Tip body");
  });

  it("reactively updates original and tooltip content", () => {
    const [value, setValue] = createSignal("First");
    const rendered = render(() => (
      <ElmTooltip original={value()} tooltip={`${value()} tip`} />
    ));

    setValue("Second");

    expect(rendered.container).not.toHaveTextContent("First");
    expect(rendered.container).toHaveTextContent("Second");
    expect(rendered.container).toHaveTextContent("Second tip");
  });

  it("composes hover handlers and cancels its pending timer on cleanup", () => {
    const onMouseOver = vi.fn();
    const onMouseLeave = vi.fn();
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const rendered = render(() => (
      <ElmTooltip
        data-testid="tooltip-host"
        original="Trigger"
        tooltip="Tip"
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
      />
    ));
    const host = rendered.getByTestId("tooltip-host");

    fireEvent.mouseOver(host);
    fireEvent.mouseLeave(host);
    expect(onMouseOver).toHaveBeenCalledOnce();
    expect(onMouseLeave).toHaveBeenCalledOnce();

    rendered.unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
