import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { page, userEvent } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

import { ElmSlider } from "./elm-slider";
import styles from "./elm-slider.module.css";

const getSlider = (container: HTMLElement) =>
  container.querySelector('[role="slider"]') as HTMLDivElement;

describe("[Browser] ElmSlider pointer interaction", () => {
  it("clicks proportionally and owns capture for the pointer lifecycle", async () => {
    let capturedOnDown = false;
    let capturedOnUp = true;
    const rendered = render(() => (
      <ElmSlider
        min={0}
        max={100}
        step={10}
        onPointerDown={(event) => {
          capturedOnDown = event.currentTarget.hasPointerCapture(
            event.pointerId,
          );
        }}
        onPointerUp={(event) => {
          capturedOnUp = event.currentTarget.hasPointerCapture(event.pointerId);
        }}
      />
    ));
    const slider = getSlider(rendered.container);
    slider.style.width = "200px";
    const screen = page.elementLocator(rendered.baseElement);

    await userEvent.click(screen.getByRole("slider"), {
      position: { x: 46, y: 10 },
    });

    expect(slider).toHaveAttribute("aria-valuenow", "20");
    expect(capturedOnDown).toBe(true);
    expect(capturedOnUp).toBe(false);
  });

  it("clamps pointer input to inner bounds and snaps negative steps", async () => {
    const rendered = render(() => (
      <ElmSlider min={0} max={100} step={-10} innerMin={20} innerMax={80} />
    ));
    const slider = getSlider(rendered.container);
    slider.style.width = "200px";
    const screen = page.elementLocator(rendered.baseElement);

    await userEvent.click(screen.getByRole("slider"), {
      position: { x: 199, y: 10 },
    });
    expect(slider).toHaveAttribute("aria-valuenow", "80");
    await userEvent.click(screen.getByRole("slider"), {
      position: { x: 106, y: 10 },
    });
    expect(slider).toHaveAttribute("aria-valuenow", "50");
  });

  it("maps vertical values upward and reversed values toward max", async () => {
    const vertical = render(() => (
      <ElmSlider min={0} max={100} orientation="vertical" step={1} />
    ));
    const verticalSlider = getSlider(vertical.container);
    verticalSlider.style.height = "200px";
    const verticalScreen = page.elementLocator(vertical.baseElement);
    await userEvent.click(verticalScreen.getByRole("slider"), {
      position: { x: 10, y: 20 },
    });
    expect(
      Number(verticalSlider.getAttribute("aria-valuenow")),
    ).toBeGreaterThanOrEqual(89);
    vertical.unmount();

    const reversed = render(() => <ElmSlider min={100} max={0} step={10} />);
    const reversedSlider = getSlider(reversed.container);
    reversedSlider.style.width = "200px";
    const reversedScreen = page.elementLocator(reversed.baseElement);
    await userEvent.click(reversedScreen.getByRole("slider"), {
      position: { x: 160, y: 10 },
    });
    expect(reversedSlider).toHaveAttribute("aria-valuenow", "20");
  });

  it("suppresses pointer interaction when disabled reactively", async () => {
    const [disabled, setDisabled] = createSignal(false);
    const onPointerDown = vi.fn();
    const rendered = render(() => (
      <ElmSlider disabled={disabled()} onPointerDown={onPointerDown} />
    ));
    const slider = getSlider(rendered.container);
    slider.style.width = "200px";
    const screen = page.elementLocator(rendered.baseElement);
    await userEvent.click(screen.getByRole("slider"), {
      position: { x: 20, y: 10 },
    });
    expect(slider).toHaveAttribute("aria-valuenow", "10");
    expect(onPointerDown).toHaveBeenCalledOnce();

    setDisabled(true);
    slider.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        pointerId: 17,
        clientX: slider.getBoundingClientRect().right,
      }),
    );
    expect(slider).toHaveAttribute("aria-valuenow", "10");
    expect(onPointerDown).toHaveBeenCalledOnce();
  });
});

describe("[Browser] ElmSlider layout and measurement", () => {
  it("renders vertical fill with the rail's full cross-axis width", () => {
    const rendered = render(() => (
      <ElmSlider orientation="vertical" defaultValue={70} />
    ));
    const fill = rendered.container.querySelector(`.${styles.fill}`)!;
    const rail = rendered.container.querySelector(`.${styles.rail}`)!;

    expect(fill.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(fill.getBoundingClientRect().width).toBeCloseTo(
      rail.getBoundingClientRect().width,
      1,
    );
    expect(fill.getBoundingClientRect().height).toBeGreaterThan(0);
  });

  it("keeps horizontal and wide vertical labels inside the wrapper", async () => {
    const horizontal = render(() => (
      <ElmSlider min={0} max={100} step={25} markers markerLabels />
    ));
    const horizontalWrapper = horizontal.container.querySelector(
      `.${styles["elm-slider"]}`,
    )!;
    horizontalWrapper.setAttribute("style", "width:300px");
    for (const label of horizontal.container.querySelectorAll(
      `.${styles["mark-label"]}`,
    )) {
      expect(label.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        horizontalWrapper.getBoundingClientRect().bottom,
      );
    }

    const vertical = render(() => (
      <div dir="rtl">
        <ElmSlider
          orientation="vertical"
          min={0}
          max={100000}
          step={25000}
          markers
          markerLabels
        />
      </div>
    ));
    const verticalWrapper = vertical.container.querySelector(
      `.${styles["elm-slider"]}`,
    )!;
    await expect
      .poll(() =>
        Number.parseFloat(
          (verticalWrapper as HTMLElement).style.getPropertyValue(
            "--elmethis-scoped-max-marker-label-width",
          ),
        ),
      )
      .toBeGreaterThan(0);
    for (const label of vertical.container.querySelectorAll(
      `.${styles["mark-label"]}`,
    )) {
      expect(label.getBoundingClientRect().right).toBeLessThanOrEqual(
        verticalWrapper.getBoundingClientRect().right + 1,
      );
    }
  });

  it("measures arbitrary JSX once and follows its mounted width changes", async () => {
    const [suffix, setSuffix] = createSignal("u");
    const formatter = vi.fn((value: number) => (
      <strong>
        {value} {suffix()}
      </strong>
    ));
    const rendered = render(() => (
      <ElmSlider
        orientation="vertical"
        min={0}
        max={100}
        step={50}
        markerLabels
        formatMarkerLabel={formatter}
      />
    ));
    const wrapper = rendered.container.querySelector(
      `.${styles["elm-slider"]}`,
    ) as HTMLElement;
    await expect
      .poll(() =>
        Number.parseFloat(
          wrapper.style.getPropertyValue(
            "--elmethis-scoped-max-marker-label-width",
          ),
        ),
      )
      .toBeGreaterThan(0);
    const initialWidth = Number.parseFloat(
      wrapper.style.getPropertyValue(
        "--elmethis-scoped-max-marker-label-width",
      ),
    );
    expect(formatter).toHaveBeenCalledTimes(3);

    setSuffix("units of measurement");
    await expect
      .poll(() =>
        Number.parseFloat(
          wrapper.style.getPropertyValue(
            "--elmethis-scoped-max-marker-label-width",
          ),
        ),
      )
      .toBeGreaterThan(initialWidth);
    expect(formatter).toHaveBeenCalledTimes(3);
  });

  it("disconnects its ResizeObserver on cleanup", () => {
    const disconnect = vi.spyOn(ResizeObserver.prototype, "disconnect");
    const rendered = render(() => (
      <ElmSlider min={0} max={10} step={5} markerLabels />
    ));

    rendered.unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  it("positions the terminal vertical marker flush with the top edge", async () => {
    const rendered = render(() => (
      <ElmSlider
        orientation="vertical"
        min={0}
        max={10}
        step={1}
        markers
        markerLabels
      />
    ));
    const screen = page.elementLocator(rendered.baseElement);
    await expect.element(screen.getByRole("slider")).toBeInTheDocument();
    const track = getSlider(rendered.container);
    const end = rendered.container.querySelector(
      `.${styles["mark-end"]}`,
    ) as HTMLElement;

    expect(
      Math.abs(
        end.getBoundingClientRect().top - track.getBoundingClientRect().top,
      ),
    ).toBeLessThan(2);
  });
});
