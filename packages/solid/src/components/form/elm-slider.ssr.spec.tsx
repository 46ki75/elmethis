import { renderToString } from "solid-js/web";
import { describe, expect, it, vi } from "vitest";

import { ElmSlider } from "./elm-slider";

describe("[SSR] ElmSlider", () => {
  it("renders its accessible interactive shell and native attributes", () => {
    const html = renderToString(() => (
      <ElmSlider
        defaultValue={40}
        aria-label="Volume"
        data-slider="server"
        tabIndex={-1}
      />
    ));

    expect(html).toContain('role="slider"');
    expect(html).toContain('aria-orientation="horizontal"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="100"');
    expect(html).toContain('aria-valuenow="40"');
    expect(html).toContain('aria-label="Volume"');
    expect(html).toContain('data-slider="server"');
    expect(html).toContain('tabIndex="-1"');
    expect(html).not.toContain('defaultValue="40"');
  });

  it("preserves reversed ranges and off-grid defaults server-side", () => {
    const html = renderToString(() => (
      <ElmSlider
        min={100}
        max={0}
        innerMin={20}
        innerMax={80}
        defaultValue={57}
        step={10}
      />
    ));

    expect(html).toContain('aria-valuemin="20"');
    expect(html).toContain('aria-valuemax="80"');
    expect(html).toContain('aria-valuenow="57"');
    expect(html).toContain("--elmethis-scoped-inner-min-ratio:0.2");
    expect(html).toContain("--elmethis-scoped-inner-max-ratio:0.8");
  });

  it("renders reversed marker grids and resolves each primitive label once", () => {
    const formatter = vi.fn((value: number) => `${value}u`);
    const html = renderToString(() => (
      <ElmSlider
        min={20}
        max={0}
        step={10}
        markers
        markerLabels
        formatMarkerLabel={formatter}
      />
    ));

    expect(formatter).toHaveBeenCalledTimes(3);
    expect(html).toContain(">20u<");
    expect(html).toContain(">10u<");
    expect(html).toContain(">0u<");
    expect(html).toContain("--elmethis-scoped-max-marker-label-chars:3");
    expect(html.match(/--elmethis-scoped-marker-ratio:/g)).toHaveLength(3);
  });

  it("renders arbitrary JSX labels without evaluating browser APIs", () => {
    const formatter = vi.fn((value: number) => (
      <strong>
        <span>{value}</span> units
      </strong>
    ));
    const html = renderToString(() => (
      <ElmSlider
        orientation="vertical"
        min={0}
        max={100}
        step={50}
        markerLabels
        formatMarkerLabel={formatter}
      />
    ));

    expect(formatter).toHaveBeenCalledTimes(3);
    expect(html).toContain("<strong");
    expect(html).toContain("100");
    expect(html).toContain(" units");
    expect(html).toContain("--elmethis-scoped-max-marker-label-width:0px");
  });

  it("clamps controlled display state without invoking onValueChange", () => {
    const onValueChange = vi.fn();
    const html = renderToString(() => (
      <ElmSlider
        value={-10}
        innerMin={20}
        innerMax={80}
        onValueChange={onValueChange}
      />
    ));

    expect(html).toContain('aria-valuenow="20"');
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
