import { describe, expect, it } from "vitest";

import { createColorScale } from "./color-scale";

describe("createColorScale", () => {
  it("interpolates the missing steps in OKLab while preserving its anchors", () => {
    expect(createColorScale("#e9dddd", "#ae6e6e", "#291313")).toEqual({
      100: "#e9dddd",
      200: "#dbc1c0",
      300: "#cda5a4",
      400: "#be8989",
      500: "#ae6e6e",
      600: "#8a5555",
      700: "#683e3e",
      800: "#472727",
      900: "#291313",
    });
  });

  it("rejects anchors that are not six-digit hex colors", () => {
    expect(() => createColorScale("red", "#ae6e6e", "#291313")).toThrow(
      "Expected a six-digit hex color, received red",
    );
  });
});
