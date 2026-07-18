import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

import { ElmPageTop } from "./elm-page-top";

describe("[Browser] ElmPageTop", () => {
  it("responds to real scrolling, activates, and cleans up", async () => {
    const removeEventListener = vi.spyOn(window, "removeEventListener");
    const rendered = render(() => (
      <div style={{ height: "2000px" }}>
        <ElmPageTop />
      </div>
    ));
    const screen = page.elementLocator(rendered.baseElement);
    const control = rendered.container.querySelector("nav")!;
    const initialClass = control.className;

    window.scrollTo(0, 320);
    await vi.waitFor(() => expect(window.scrollY).toBeGreaterThan(100));
    await vi.waitFor(() => expect(control.className).not.toBe(initialClass));
    expect(getComputedStyle(control).position).toBe("fixed");
    expect(control).toHaveAttribute("aria-hidden", "false");
    expect(control).toHaveAttribute("tabindex", "0");

    const scrollTo = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);
    await screen.getByRole("button", { name: "Back to Top" }).click();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

    rendered.unmount();
    expect(removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
    scrollTo.mockRestore();
    window.scrollTo(0, 0);
  });
});
