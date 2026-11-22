import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import {
  createControllableSignal,
  type CreateControllableSignalOptions,
} from "./create-controllable-signal";

const setup = <T>(options: CreateControllableSignalOptions<T>) =>
  createRoot(
    (dispose) => [createControllableSignal(options), dispose] as const,
  );

describe("createControllableSignal", () => {
  it("owns state in uncontrolled mode and supports updater callbacks", () => {
    const onChange = vi.fn();
    const [[value, setValue], dispose] = setup({
      defaultValue: () => 1,
      onChange,
    });

    expect(value()).toBe(1);
    expect(setValue(2)).toBe(2);
    flush();
    expect(value()).toBe(2);
    expect(setValue((previous) => previous + 3)).toBe(5);
    flush();
    expect(value()).toBe(5);
    expect(onChange).toHaveBeenNthCalledWith(1, 2);
    expect(onChange).toHaveBeenNthCalledWith(2, 5);
    dispose();
  });

  it("composes rapid uncontrolled updaters before the reactive commit", () => {
    const onChange = vi.fn();
    const [[value, setValue], dispose] = setup({
      defaultValue: () => 1,
      onChange,
    });

    expect(setValue((previous) => previous + 1)).toBe(2);
    expect(setValue((previous) => previous + 1)).toBe(3);
    expect(onChange.mock.calls).toEqual([[2], [3]]);
    flush();
    expect(value()).toBe(3);
    dispose();
  });

  it("treats the parent value as the source of truth in controlled mode", () => {
    const onChange = vi.fn();
    const [parentValue, setParentValue] = createSignal("parent");
    const [[value, setValue], dispose] = setup({
      value: parentValue,
      defaultValue: () => "default",
      onChange,
    });

    expect(value()).toBe("parent");
    expect(setValue("requested")).toBe("requested");
    expect(onChange).toHaveBeenCalledWith("requested");
    flush();
    expect(value()).toBe("parent");

    setParentValue("updated by parent");
    flush();
    expect(value()).toBe("updated by parent");
    dispose();
  });

  it("resolves controlled updater callbacks from the effective parent value", () => {
    const [parentValue, setParentValue] = createSignal(2);
    const onChange = vi.fn((next: number) => setParentValue(next));
    const [[value, setValue], dispose] = setup({
      value: parentValue,
      defaultValue: () => 0,
      onChange,
    });

    setValue((previous) => previous * 3);
    expect(onChange).toHaveBeenCalledWith(6);
    flush();
    expect(value()).toBe(6);
    dispose();
  });

  it.each([
    [false, "boolean false"],
    [0, "zero"],
    ["", "empty string"],
    [null, "null"],
  ])("treats %s as a controlled value (%s)", (controlledValue, _label) => {
    const [[value], dispose] = setup({
      value: () => controlledValue,
      defaultValue: () => "uncontrolled",
    });

    expect(value()).toBe(controlledValue);
    dispose();
  });

  it("can switch modes without replacing retained uncontrolled state", () => {
    const [parentValue, setParentValue] = createSignal<string>();
    const [[value, setValue], dispose] = setup({
      value: parentValue,
      defaultValue: () => "default",
    });

    setValue("internal");
    flush();
    expect(value()).toBe("internal");

    setParentValue("controlled");
    flush();
    expect(value()).toBe("controlled");

    setValue("ignored without onChange");
    flush();
    expect(value()).toBe("controlled");

    setParentValue(undefined);
    flush();
    expect(value()).toBe("internal");
    dispose();
  });

  it("does not notify for Object.is-equivalent writes", () => {
    const onChange = vi.fn();
    const [[value, setValue], dispose] = setup({
      defaultValue: () => Number.NaN,
      onChange,
    });

    setValue(Number.NaN);
    expect(value()).toBeNaN();
    expect(onChange).not.toHaveBeenCalled();
    dispose();
  });

  it("supports function-valued state through setter callback semantics", () => {
    const initial = () => "initial";
    const replacement = () => "replacement";
    const [[value, setValue], dispose] = setup({ defaultValue: () => initial });

    expect(value()).toBe(initial);
    setValue(() => replacement);
    flush();
    expect(value()).toBe(replacement);
    dispose();
  });

  it("evaluates the default accessor once", () => {
    const defaultValue = vi.fn(() => ({ count: 1 }));
    const [[value], dispose] = setup({ defaultValue });

    expect(value()).toEqual({ count: 1 });
    expect(value()).toEqual({ count: 1 });
    expect(defaultValue).toHaveBeenCalledOnce();
    dispose();
  });
});
