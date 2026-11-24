import { render } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { expect, it } from "vitest";

import { ElmProgress } from "./elm-progress";

it("keeps the native progress and the visual fill in sync as props change", () => {
  const [max, setMax] = createSignal(200);
  const [value, setValue] = createSignal(50);
  const rendered = render(() => (
    <ElmProgress
      aria-label="Upload progress"
      max={max()}
      value={value()}
      color="var(--elmethis-color-primary)"
    />
  ));
  const progress = rendered.getByRole("progressbar", {
    name: "Upload progress",
  });
  if (!(progress instanceof HTMLProgressElement)) {
    throw new Error("Expected a native progress element");
  }

  const fillScale = () =>
    new DOMMatrixReadOnly(getComputedStyle(progress, "::after").transform).a;

  expect(progress.position).toBe(0.25);
  expect(fillScale()).toBe(0.25);

  setMax(100);
  setValue(75);
  flush();

  expect(progress.max).toBe(100);
  expect(progress.value).toBe(75);
  expect(progress.position).toBe(0.75);
  expect(fillScale()).toBe(0.75);
});
