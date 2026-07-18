import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ElmPageTop } from "./elm-page-top";

describe("[CSR] ElmPageTop", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders an accessible nav control and reactively positions it", () => {
    const [position, setPosition] = createSignal<"left" | "right">("right");
    const rendered = render(() => (
      <ElmPageTop
        position={position()}
        class="custom-page-top"
        style={{ "--elmethis-scoped-size": "80px" }}
        data-testid="page-top"
      />
    ));
    const control = rendered.getByTestId("page-top");

    expect(control.tagName).toBe("NAV");
    expect(control).toHaveAttribute("aria-hidden", "true");
    expect(control).toHaveAttribute("tabindex", "-1");
    expect(control).toHaveClass("custom-page-top");
    expect(control).toHaveStyle({ right: "0px", left: "auto" });
    expect(
      (control as HTMLElement).style.getPropertyValue("--elmethis-scoped-size"),
    ).toBe("80px");

    setPosition("left");
    expect(control).toHaveStyle({ left: "0px", right: "auto" });
  });

  it("becomes visible after scrolling and removes its listener", () => {
    let scrollY = 0;
    vi.spyOn(window, "scrollY", "get").mockImplementation(() => scrollY);
    const removeEventListener = vi.spyOn(window, "removeEventListener");
    const rendered = render(() => <ElmPageTop />);
    const control = rendered.container.querySelector("nav")!;
    const initialClass = control.className;

    scrollY = 101;
    window.dispatchEvent(new Event("scroll"));
    expect(control.className).not.toBe(initialClass);
    expect(control).toHaveAttribute("aria-hidden", "false");
    expect(control).toHaveAttribute("tabindex", "0");

    rendered.unmount();
    expect(removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
  });

  it("scrolls smoothly on click and keyboard while composing handlers", () => {
    const scrollTo = vi.fn();
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    const rendered = render(() => (
      <ElmPageTop onClick={onClick} onKeyDown={onKeyDown} />
    ));
    const control = rendered.container.querySelector("nav")!;

    fireEvent.click(control);
    fireEvent.keyDown(control, { key: " " });

    expect(scrollTo).toHaveBeenCalledTimes(2);
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: "smooth" });
    expect(onClick).toHaveBeenCalledOnce();
    expect(onKeyDown).toHaveBeenCalledOnce();
  });
});
