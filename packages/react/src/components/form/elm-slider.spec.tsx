import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { useState } from "react";

import { ElmSlider } from "./elm-slider";

const slider = (container: HTMLElement) =>
  container.querySelector('[role="slider"]') as HTMLElement;

describe("[CSR] ElmSlider — rendering", () => {
  it("defaults to horizontal, min 0, max 100, midpoint value", () => {
    const { container } = render(<ElmSlider />);
    const el = slider(container);
    expect(el.getAttribute("aria-orientation")).toBe("horizontal");
    expect(el.getAttribute("aria-valuemin")).toBe("0");
    expect(el.getAttribute("aria-valuemax")).toBe("100");
    expect(el.getAttribute("aria-valuenow")).toBe("50");
  });

  it("renders vertical orientation", () => {
    const { container } = render(<ElmSlider orientation="vertical" />);
    expect(slider(container).getAttribute("aria-orientation")).toBe("vertical");
  });

  it("defaultValue seeds the uncontrolled value", () => {
    const { container } = render(<ElmSlider defaultValue={30} />);
    expect(slider(container).getAttribute("aria-valuenow")).toBe("30");
  });

  it("clamps aria-valuemin/max to the inner range", () => {
    const { container } = render(
      <ElmSlider innerMin={20} innerMax={80} defaultValue={50} />,
    );
    const el = slider(container);
    expect(el.getAttribute("aria-valuemin")).toBe("20");
    expect(el.getAttribute("aria-valuemax")).toBe("80");
  });

  it("clamps an out-of-inner-range defaultValue on mount", () => {
    const { container } = render(
      <ElmSlider innerMin={20} innerMax={80} defaultValue={5} />,
    );
    expect(slider(container).getAttribute("aria-valuenow")).toBe("20");
  });

  it("aria-disabled and tabIndex reflect the disabled prop", () => {
    const { container } = render(<ElmSlider disabled />);
    const el = slider(container);
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el).toHaveAttribute("tabIndex", "-1");
  });

  it("renders one tick per step when markers is set", () => {
    const { container } = render(
      <ElmSlider min={0} max={100} step={25} markers />,
    );
    // 0, 25, 50, 75, 100
    expect(container.querySelectorAll("i")).toHaveLength(5);
  });

  it("renders marker labels with the formatted value", () => {
    const { container } = render(
      <ElmSlider
        min={0}
        max={100}
        step={50}
        markers
        markerLabels
        formatMarkerLabel={(v) => `${v}%`}
      />,
    );
    expect(container.textContent).toContain("0%");
    expect(container.textContent).toContain("50%");
    expect(container.textContent).toContain("100%");
  });
});

describe("[CSR] ElmSlider — keyboard interaction", () => {
  it("ArrowRight/ArrowUp increases the value by step", () => {
    const { container } = render(<ElmSlider defaultValue={50} step={5} />);
    const el = slider(container);

    fireEvent.keyDown(el, { key: "ArrowRight" });
    expect(el.getAttribute("aria-valuenow")).toBe("55");

    fireEvent.keyDown(el, { key: "ArrowUp" });
    expect(el.getAttribute("aria-valuenow")).toBe("60");
  });

  it("ArrowLeft/ArrowDown decreases the value by step", () => {
    const { container } = render(<ElmSlider defaultValue={50} step={5} />);
    const el = slider(container);

    fireEvent.keyDown(el, { key: "ArrowLeft" });
    expect(el.getAttribute("aria-valuenow")).toBe("45");

    fireEvent.keyDown(el, { key: "ArrowDown" });
    expect(el.getAttribute("aria-valuenow")).toBe("40");
  });

  it("Home/End jump to the inner bounds", () => {
    const { container } = render(
      <ElmSlider innerMin={20} innerMax={80} defaultValue={50} />,
    );
    const el = slider(container);

    fireEvent.keyDown(el, { key: "End" });
    expect(el.getAttribute("aria-valuenow")).toBe("80");

    fireEvent.keyDown(el, { key: "Home" });
    expect(el.getAttribute("aria-valuenow")).toBe("20");
  });

  it("does not move past the inner bounds", () => {
    const { container } = render(
      <ElmSlider innerMin={0} innerMax={100} defaultValue={98} step={5} />,
    );
    const el = slider(container);

    fireEvent.keyDown(el, { key: "ArrowRight" });
    expect(el.getAttribute("aria-valuenow")).toBe("100");
  });

  it("does not respond to keyboard input when disabled", () => {
    const { container } = render(<ElmSlider defaultValue={50} disabled />);
    const el = slider(container);

    fireEvent.keyDown(el, { key: "ArrowRight" });
    expect(el.getAttribute("aria-valuenow")).toBe("50");
  });

  it("writes through to a bound parent value", () => {
    const Harness = () => {
      const [value, setValue] = useState(50);
      return (
        <div>
          <output data-testid="state">{value}</output>
          <ElmSlider value={value} onValueChange={setValue} step={10} />
        </div>
      );
    };

    const { container, getByTestId } = render(<Harness />);
    fireEvent.keyDown(slider(container), { key: "ArrowRight" });

    expect(getByTestId("state")).toHaveTextContent("60");
    expect(slider(container).getAttribute("aria-valuenow")).toBe("60");
  });
});

// Regression tests for bugs found in code review — each asserts the correct
// behavior and currently FAILS against the present implementation.
describe("[CSR] ElmSlider — known bugs (regression)", () => {
  it("clamps a controlled value that falls outside the inner range", () => {
    const { container } = render(
      <ElmSlider
        innerMin={20}
        innerMax={80}
        value={5}
        onValueChange={() => {}}
      />,
    );
    const el = slider(container);
    expect(Number(el.getAttribute("aria-valuenow"))).toBeGreaterThanOrEqual(20);
  });

  it("formats marker labels without floating-point dust for a fractional step", () => {
    const { container } = render(
      <ElmSlider min={0} max={1} step={0.1} markers markerLabels />,
    );
    // 0 + 3*0.1 drifts to 0.30000000000000004 in JS float math.
    expect(container.textContent).not.toMatch(/0\.30000/);
  });

  it("does not skip a tick due to floating-point step-count error", () => {
    const { container } = render(
      <ElmSlider min={0} max={0.3} step={0.1} markers markerLabels />,
    );
    const labels = Array.from(
      container.querySelectorAll('[class*="mark-label"]'),
    ).map((el) => el.textContent);
    // Expect all 4 ticks: 0, 0.1, 0.2, 0.3. (0.3-0)/0.1 evaluates to
    // 2.9999999999999996 in JS float math, so Math.floor undercounts to 2
    // and the "0.2" tick is dropped, jumping straight from 0.1 to the
    // forced max=0.3.
    expect(labels).toHaveLength(4);
  });

  it("spans the full range instead of clustering near min when the tick count exceeds MAX_MARKERS", () => {
    const { container } = render(
      <ElmSlider min={0} max={100} step={0.01} markers />,
    );
    const marks = container.querySelectorAll('[class*="mark"]');
    const last = marks[marks.length - 1] as HTMLElement;
    const lastRatio = Number(
      last.style.getPropertyValue("--elmethis-scoped-marker-ratio"),
    );
    // The capped 501 rendered ticks should still stretch across [min, max];
    // currently the last one sits at ratio 0.05 (value 5) instead of 1 (100).
    expect(lastRatio).toBeCloseTo(1, 5);
  });

  it("ArrowRight increases the value even when step is negative", () => {
    const { container } = render(<ElmSlider defaultValue={50} step={-10} />);
    const el = slider(container);

    fireEvent.keyDown(el, { key: "ArrowRight" });

    expect(Number(el.getAttribute("aria-valuenow"))).toBeGreaterThan(50);
  });

  it("forwards aria-label to the slider element, not an outer wrapper", () => {
    const { container } = render(<ElmSlider aria-label="Volume" />);
    expect(slider(container)).toHaveAttribute("aria-label", "Volume");
  });
});

describe("[SSR] ElmSlider", () => {
  it("renders the slider role in the server shell", () => {
    const html = renderToStaticMarkup(<ElmSlider defaultValue={40} />);
    expect(html).toContain('role="slider"');
    expect(html).toContain('aria-valuenow="40"');
  });
});
