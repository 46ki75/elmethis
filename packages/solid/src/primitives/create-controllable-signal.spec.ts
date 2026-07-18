import { createRoot, createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { createControllableSignal } from "./create-controllable-signal";

describe("createControllableSignal", () => {
  it("owns state in uncontrolled mode and supports updater callbacks", () => {
    const onChange = vi.fn();

    createRoot((dispose) => {
      const [value, setValue] = createControllableSignal({
        defaultValue: () => 1,
        onChange,
      });

      expect(value()).toBe(1);
      expect(setValue(2)).toBe(2);
      expect(value()).toBe(2);
      expect(setValue((previous) => previous + 3)).toBe(5);
      expect(value()).toBe(5);
      expect(onChange).toHaveBeenNthCalledWith(1, 2);
      expect(onChange).toHaveBeenNthCalledWith(2, 5);

      dispose();
    });
  });

  it("treats the parent value as the source of truth in controlled mode", () => {
    const onChange = vi.fn();

    createRoot((dispose) => {
      const [parentValue, setParentValue] = createSignal("parent");
      const [value, setValue] = createControllableSignal({
        value: parentValue,
        defaultValue: () => "default",
        onChange,
      });

      expect(value()).toBe("parent");

      expect(setValue("requested")).toBe("requested");
      expect(onChange).toHaveBeenCalledWith("requested");
      expect(value()).toBe("parent");

      setParentValue("updated by parent");
      expect(value()).toBe("updated by parent");

      dispose();
    });
  });

  it("resolves controlled updater callbacks from the effective parent value", () => {
    createRoot((dispose) => {
      const [parentValue, setParentValue] = createSignal(2);
      const onChange = vi.fn((next: number) => setParentValue(next));
      const [value, setValue] = createControllableSignal({
        value: parentValue,
        defaultValue: () => 0,
        onChange,
      });

      setValue((previous) => previous * 3);

      expect(onChange).toHaveBeenCalledWith(6);
      expect(value()).toBe(6);

      dispose();
    });
  });

  it.each([
    [false, "boolean false"],
    [0, "zero"],
    ["", "empty string"],
    [null, "null"],
  ])("treats %s as a controlled value (%s)", (controlledValue, _label) => {
    createRoot((dispose) => {
      const [value] = createControllableSignal({
        value: () => controlledValue,
        defaultValue: () => "uncontrolled",
      });

      expect(value()).toBe(controlledValue);

      dispose();
    });
  });

  it("can switch modes without replacing retained uncontrolled state", () => {
    createRoot((dispose) => {
      const [parentValue, setParentValue] = createSignal<string>();
      const [value, setValue] = createControllableSignal({
        value: parentValue,
        defaultValue: () => "default",
      });

      setValue("internal");
      expect(value()).toBe("internal");

      setParentValue("controlled");
      expect(value()).toBe("controlled");

      setValue("ignored without onChange");
      expect(value()).toBe("controlled");

      setParentValue(undefined);
      expect(value()).toBe("internal");

      dispose();
    });
  });

  it("does not notify for Object.is-equivalent writes", () => {
    const onChange = vi.fn();

    createRoot((dispose) => {
      const [value, setValue] = createControllableSignal({
        defaultValue: () => Number.NaN,
        onChange,
      });

      setValue(Number.NaN);

      expect(value()).toBeNaN();
      expect(onChange).not.toHaveBeenCalled();

      dispose();
    });
  });

  it("supports function-valued state through setter callback semantics", () => {
    createRoot((dispose) => {
      const initial = () => "initial";
      const replacement = () => "replacement";
      const [value, setValue] = createControllableSignal({
        defaultValue: () => initial,
      });

      expect(value()()).toBe("initial");

      setValue(() => replacement);
      expect(value()()).toBe("replacement");

      dispose();
    });
  });

  it("evaluates the default accessor once", () => {
    const defaultValue = vi.fn(() => ({ count: 1 }));

    createRoot((dispose) => {
      const [value] = createControllableSignal({ defaultValue });

      expect(value()).toEqual({ count: 1 });
      expect(value()).toEqual({ count: 1 });
      expect(defaultValue).toHaveBeenCalledOnce();

      dispose();
    });
  });
});
