import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ElmSlider } from "./elm-slider";
import styles from "./elm-slider.module.css";

const getSlider = (container: HTMLElement) =>
  container.querySelector('[role="slider"]') as HTMLDivElement;

const getWrapper = (container: HTMLElement) =>
  container.querySelector(`.${styles["elm-slider"]}`) as HTMLDivElement;

const getLabels = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(`.${styles["mark-label"]}`)).map(
    (element) => element.textContent,
  );

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("[CSR] ElmSlider rendering", () => {
  it("renders the documented defaults and horizontal value geometry", () => {
    const rendered = render(() => <ElmSlider />);
    const slider = getSlider(rendered.container);
    const wrapper = getWrapper(rendered.container);

    expect(slider).toHaveAttribute("aria-orientation", "horizontal");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "100");
    expect(slider).toHaveAttribute("aria-valuenow", "50");
    expect(slider).toHaveAttribute("tabindex", "0");
    expect(
      wrapper.style.getPropertyValue("--elmethis-scoped-value-ratio"),
    ).toBe("0.5");
  });

  it("preserves off-grid defaults and clamps only to inner bounds", () => {
    const rendered = render(() => (
      <ElmSlider step={10} innerMin={20} innerMax={80} defaultValue={7} />
    ));
    const slider = getSlider(rendered.container);

    expect(slider).toHaveAttribute("aria-valuemin", "20");
    expect(slider).toHaveAttribute("aria-valuemax", "80");
    expect(slider).toHaveAttribute("aria-valuenow", "20");
  });

  it("supports reversed full ranges with and without explicit inner bounds", () => {
    const bounded = render(() => (
      <ElmSlider
        min={100}
        max={0}
        innerMin={20}
        innerMax={80}
        defaultValue={50}
      />
    ));
    const slider = getSlider(bounded.container);
    const wrapper = getWrapper(bounded.container);

    expect(slider).toHaveAttribute("aria-valuemin", "20");
    expect(slider).toHaveAttribute("aria-valuemax", "80");
    expect(slider).toHaveAttribute("aria-valuenow", "50");
    expect(
      wrapper.style.getPropertyValue("--elmethis-scoped-inner-min-ratio"),
    ).toBe("0.2");
    expect(
      wrapper.style.getPropertyValue("--elmethis-scoped-inner-max-ratio"),
    ).toBe("0.8");

    const unbounded = render(() => (
      <ElmSlider min={100} max={0} defaultValue={30} />
    ));
    expect(getSlider(unbounded.container)).toHaveAttribute(
      "aria-valuenow",
      "30",
    );
    expect(getSlider(unbounded.container)).toHaveAttribute(
      "aria-valuemin",
      "0",
    );
    expect(getSlider(unbounded.container)).toHaveAttribute(
      "aria-valuemax",
      "100",
    );
  });

  it("clamps a controlled value for display without emitting a correction", () => {
    const onValueChange = vi.fn();
    const rendered = render(() => (
      <ElmSlider
        innerMin={20}
        innerMax={80}
        value={95}
        onValueChange={onValueChange}
      />
    ));

    expect(getSlider(rendered.container)).toHaveAttribute(
      "aria-valuenow",
      "80",
    );
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("reacts to controlled values, bounds, orientation, and disabled state", () => {
    const [value, setValue] = createSignal(30);
    const [innerMax, setInnerMax] = createSignal(80);
    const [vertical, setVertical] = createSignal(false);
    const [disabled, setDisabled] = createSignal(false);
    const rendered = render(() => (
      <ElmSlider
        value={value()}
        innerMax={innerMax()}
        orientation={vertical() ? "vertical" : "horizontal"}
        disabled={disabled()}
      />
    ));
    const slider = getSlider(rendered.container);
    const wrapper = getWrapper(rendered.container);

    setValue(90);
    expect(slider).toHaveAttribute("aria-valuenow", "80");
    setInnerMax(70);
    expect(slider).toHaveAttribute("aria-valuenow", "70");
    setVertical(true);
    expect(slider).toHaveAttribute("aria-orientation", "vertical");
    expect(wrapper).toHaveClass(styles.vertical);
    setDisabled(true);
    expect(slider).toHaveAttribute("aria-disabled", "true");
    expect(slider).toHaveAttribute("tabindex", "-1");
  });

  it("puts native props and refs on the track while class and style decorate the wrapper", () => {
    let ref: HTMLDivElement | undefined;
    const rendered = render(() => (
      <ElmSlider
        ref={(element) => {
          ref = element;
        }}
        class="custom-slider"
        style={{ width: "12rem" }}
        id="volume"
        data-track="native"
        aria-label="Volume"
        tabIndex={-1}
      />
    ));
    const slider = getSlider(rendered.container);
    const wrapper = getWrapper(rendered.container);

    expect(ref).toBe(slider);
    expect(slider).toHaveAttribute("id", "volume");
    expect(slider).toHaveAttribute("data-track", "native");
    expect(slider).toHaveAttribute("aria-label", "Volume");
    expect(slider).toHaveAttribute("tabindex", "-1");
    expect(slider).not.toHaveAttribute("min");
    expect(wrapper).toHaveClass("custom-slider");
    expect(wrapper.style.width).toBe("12rem");
  });
});

describe("[CSR] ElmSlider markers", () => {
  it("walks the real grid, removes float dust, and includes a trailing max", () => {
    const fractional = render(() => (
      <ElmSlider min={0} max={0.3} step={0.1} markers markerLabels />
    ));
    expect(getLabels(fractional.container)).toEqual(["0", "0.1", "0.2", "0.3"]);

    const remainder = render(() => (
      <ElmSlider min={0} max={10} step={3} markers markerLabels />
    ));
    expect(getLabels(remainder.container)).toEqual(["0", "3", "6", "9", "10"]);

    const noOverflow = render(() => (
      <ElmSlider min={0} max={10} step={6} markers markerLabels />
    ));
    expect(getLabels(noOverflow.container)).toEqual(["0", "6", "10"]);
  });

  it("treats negative step as granularity and walks reversed grids downward", () => {
    const negative = render(() => (
      <ElmSlider min={0} max={20} step={-4} markers markerLabels />
    ));
    expect(getLabels(negative.container)).toEqual([
      "0",
      "4",
      "8",
      "12",
      "16",
      "20",
    ]);

    const reversed = render(() => (
      <ElmSlider min={100} max={0} step={10} markers markerLabels />
    ));
    expect(getLabels(reversed.container)).toEqual([
      "100",
      "90",
      "80",
      "70",
      "60",
      "50",
      "40",
      "30",
      "20",
      "10",
      "0",
    ]);
  });

  it("caps at 501 evenly resampled markers spanning the full range", () => {
    const rendered = render(() => (
      <ElmSlider min={0} max={100} step={0.01} markers />
    ));
    const marks = rendered.container.querySelectorAll(`.${styles.mark}`);

    expect(marks).toHaveLength(501);
    expect(
      (marks[250] as HTMLElement).style.getPropertyValue(
        "--elmethis-scoped-marker-ratio",
      ),
    ).toBe("0.5");
    expect(
      (marks[500] as HTMLElement).style.getPropertyValue(
        "--elmethis-scoped-marker-ratio",
      ),
    ).toBe("1");
  });

  it("resolves each arbitrary JSX label once and keeps primitive SSR sizing data", () => {
    const formatter = vi.fn((value: number) => <strong>{value}% wide</strong>);
    const jsx = render(() => (
      <ElmSlider
        min={0}
        max={100}
        step={50}
        markerLabels
        formatMarkerLabel={formatter}
      />
    ));

    expect(formatter).toHaveBeenCalledTimes(3);
    expect(getLabels(jsx.container)).toEqual([
      "0% wide",
      "50% wide",
      "100% wide",
    ]);
    expect(
      getWrapper(jsx.container).style.getPropertyValue(
        "--elmethis-scoped-max-marker-label-chars",
      ),
    ).toBe("0");

    const primitive = render(() => (
      <ElmSlider
        min={0}
        max={100}
        step={50}
        markerLabels
        formatMarkerLabel={(value) => `${value} units`}
      />
    ));
    expect(
      getWrapper(primitive.container).style.getPropertyValue(
        "--elmethis-scoped-max-marker-label-chars",
      ),
    ).toBe("9");
  });

  it("updates marker labels without replacing marks on formatter changes", () => {
    const [formatter, setFormatter] = createSignal<(value: number) => string>(
      (value) => `${value}%`,
    );
    const rendered = render(() => (
      <ElmSlider
        min={0}
        max={10}
        step={5}
        markers
        markerLabels
        formatMarkerLabel={formatter()}
      />
    ));
    const marks = Array.from(
      rendered.container.querySelectorAll(`.${styles.mark}`),
    );

    setFormatter(() => (value: number) => `${value} units`);

    expect(getLabels(rendered.container)).toEqual([
      "0 units",
      "5 units",
      "10 units",
    ]);
    Array.from(rendered.container.querySelectorAll(`.${styles.mark}`)).forEach(
      (mark, index) => expect(mark).toBe(marks[index]),
    );
  });
});

describe("[CSR] ElmSlider keyboard and callbacks", () => {
  it("handles arrows, pages, Home, and End relative to the displayed value", () => {
    const rendered = render(() => (
      <ElmSlider innerMin={20} innerMax={80} defaultValue={50} step={3} />
    ));
    const slider = getSlider(rendered.container);

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).toHaveAttribute("aria-valuenow", "53");
    fireEvent.keyDown(slider, { key: "ArrowUp" });
    expect(slider).toHaveAttribute("aria-valuenow", "56");
    fireEvent.keyDown(slider, { key: "PageUp" });
    expect(slider).toHaveAttribute("aria-valuenow", "80");
    fireEvent.keyDown(slider, { key: "PageDown" });
    expect(slider).toHaveAttribute("aria-valuenow", "50");
    fireEvent.keyDown(slider, { key: "Home" });
    expect(slider).toHaveAttribute("aria-valuenow", "20");
    fireEvent.keyDown(slider, { key: "End" });
    expect(slider).toHaveAttribute("aria-valuenow", "80");
    fireEvent.keyDown(slider, { key: "ArrowDown" });
    expect(slider).toHaveAttribute("aria-valuenow", "77");
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(slider).toHaveAttribute("aria-valuenow", "74");
  });

  it("moves exactly one absolute step from controlled off-grid and clamped values", () => {
    const offGridChange = vi.fn();
    const offGrid = render(() => (
      <ElmSlider value={7} step={-10} onValueChange={offGridChange} />
    ));
    fireEvent.keyDown(getSlider(offGrid.container), { key: "ArrowRight" });
    expect(offGridChange).toHaveBeenCalledWith(17);

    const [value, setValue] = createSignal(95);
    const clamped = render(() => (
      <ElmSlider
        value={value()}
        innerMax={80}
        step={1}
        onValueChange={setValue}
      />
    ));
    const slider = getSlider(clamped.container);
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(slider).toHaveAttribute("aria-valuenow", "79");
  });

  it("composes native keyboard and pointer callbacks when enabled", () => {
    const onKeyDown = vi.fn();
    const onPointerMove = vi.fn();
    const rendered = render(() => (
      <ElmSlider
        defaultValue={50}
        onKeyDown={onKeyDown}
        onPointerMove={onPointerMove}
      />
    ));
    const slider = getSlider(rendered.container);

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.pointerMove(slider, { pointerId: 7, clientX: 10 });

    expect(slider).toHaveAttribute("aria-valuenow", "51");
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onPointerMove).toHaveBeenCalledOnce();
  });

  it("suppresses internal changes and caller callbacks while disabled", () => {
    const onKeyDown = vi.fn();
    const onPointerDown = vi.fn();
    const rendered = render(() => (
      <ElmSlider
        disabled
        defaultValue={50}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
      />
    ));
    const slider = getSlider(rendered.container);

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 10 });

    expect(slider).toHaveAttribute("aria-valuenow", "50");
    expect(onKeyDown).not.toHaveBeenCalled();
    expect(onPointerDown).not.toHaveBeenCalled();
  });
});

describe("[CSR] ElmSlider lifecycle", () => {
  it("releases active capture when disabled and disconnects label observation", () => {
    const disconnect = vi.fn();
    const observe = vi.fn();
    const unobserve = vi.fn();
    class ResizeObserverMock {
      observe = observe;
      unobserve = unobserve;
      disconnect = disconnect;
    }
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);

    const [disabled, setDisabled] = createSignal(false);
    const rendered = render(() => (
      <ElmSlider disabled={disabled()} min={0} max={10} step={5} markerLabels />
    ));
    const slider = getSlider(rendered.container);
    let captured: number | undefined;
    const releasePointerCapture = vi.fn((pointerId: number) => {
      captured = captured === pointerId ? undefined : captured;
    });
    Object.defineProperties(slider, {
      setPointerCapture: {
        value: vi.fn((pointerId: number) => {
          captured = pointerId;
        }),
      },
      hasPointerCapture: {
        value: vi.fn((pointerId: number) => captured === pointerId),
      },
      releasePointerCapture: { value: releasePointerCapture },
    });

    fireEvent.pointerDown(slider, { pointerId: 9, clientX: 0, clientY: 0 });
    expect(captured).toBe(9);
    setDisabled(true);
    expect(releasePointerCapture).toHaveBeenCalledWith(9);
    expect(captured).toBeUndefined();
    expect(observe).toHaveBeenCalledTimes(3);

    rendered.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("releases active capture when unmounted", () => {
    const rendered = render(() => <ElmSlider />);
    const slider = getSlider(rendered.container);
    let captured: number | undefined;
    const releasePointerCapture = vi.fn(() => {
      captured = undefined;
    });
    Object.defineProperties(slider, {
      setPointerCapture: {
        value: (pointerId: number) => {
          captured = pointerId;
        },
      },
      hasPointerCapture: {
        value: (pointerId: number) => captured === pointerId,
      },
      releasePointerCapture: { value: releasePointerCapture },
    });

    fireEvent.pointerDown(slider, { pointerId: 4 });
    rendered.unmount();

    expect(releasePointerCapture).toHaveBeenCalledWith(4);
  });
});
