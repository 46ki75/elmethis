import { fireEvent, render } from "@solidjs/testing-library";
import { untrack } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createLocalStorage, createSessionStorage } from "./create-storage";

const LocalHarness = (props: { storageKey: string }) => {
  const storageKey = untrack(() => props.storageKey);
  const storage = createLocalStorage<string | null>({
    key: storageKey,
    initialValue: "seed",
  });
  return (
    <div>
      <output data-testid="value">{JSON.stringify(storage.state())}</output>
      <button type="button" onClick={() => storage.setState("next")}>
        Set
      </button>
      <button type="button" onClick={() => storage.setState(null)}>
        Null
      </button>
      <button type="button" onClick={storage.remove}>
        Remove
      </button>
    </div>
  );
};

const LocalPair = (props: { storageKey: string }) => {
  const storageKey = untrack(() => props.storageKey);
  const first = createLocalStorage<string | null>({
    key: storageKey,
    initialValue: "seed",
  });
  const second = createLocalStorage<string | null>({
    key: storageKey,
    initialValue: "seed",
  });
  return (
    <div>
      <output data-testid="first">{JSON.stringify(first.state())}</output>
      <output data-testid="second">{JSON.stringify(second.state())}</output>
      <button type="button" onClick={() => first.setState(null)}>
        Null
      </button>
      <button type="button" onClick={first.remove}>
        Remove
      </button>
    </div>
  );
};

describe("[CSR] createLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("hydrates after mount and persists the initial value for an empty key", () => {
    localStorage.setItem("hydrated", JSON.stringify("stored"));
    const hydrated = render(() => <LocalHarness storageKey="hydrated" />);
    expect(hydrated.getByTestId("value")).toHaveTextContent('"stored"');

    render(() => <LocalHarness storageKey="empty" />);
    expect(localStorage.getItem("empty")).toBe(JSON.stringify("seed"));
  });

  it("supports Solid setter callbacks and writes their resolved value", () => {
    let controller!: ReturnType<typeof createLocalStorage<number>>;
    const Harness = () => {
      controller = createLocalStorage({ key: "counter", initialValue: 1 });
      return <output>{controller.state()}</output>;
    };
    render(() => <Harness />);

    expect(controller.setState((previous) => previous + 1)).toBe(2);
    expect(controller.state()).toBe(2);
    expect(localStorage.getItem("counter")).toBe("2");
  });

  it("synchronizes same-tab controllers and distinguishes null from removal", () => {
    const rendered = render(() => <LocalPair storageKey="shared" />);

    fireEvent.click(rendered.getByRole("button", { name: "Null" }));
    expect(rendered.getByTestId("first")).toHaveTextContent("null");
    expect(rendered.getByTestId("second")).toHaveTextContent("null");
    expect(localStorage.getItem("shared")).toBe("null");

    fireEvent.click(rendered.getByRole("button", { name: "Remove" }));
    expect(rendered.getByTestId("first")).toHaveTextContent('"seed"');
    expect(rendered.getByTestId("second")).toHaveTextContent('"seed"');
    expect(localStorage.getItem("shared")).toBeNull();
  });

  it("observes native storage events and ignores malformed JSON", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const rendered = render(() => <LocalHarness storageKey="events" />);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "events",
        newValue: JSON.stringify("external"),
      }),
    );
    expect(rendered.getByTestId("value")).toHaveTextContent('"external"');

    window.dispatchEvent(
      new StorageEvent("storage", { key: "events", newValue: "{" }),
    );
    expect(rendered.getByTestId("value")).toHaveTextContent('"external"');
    expect(warn).toHaveBeenCalledWith(
      'createStorage: failed to parse "events"',
      expect.anything(),
    );
  });

  it("keeps reactive state usable when storage is denied", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    const rendered = render(() => <LocalHarness storageKey="denied" />);

    fireEvent.click(rendered.getByRole("button", { name: "Set" }));
    expect(rendered.getByTestId("value")).toHaveTextContent('"next"');

    fireEvent.click(rendered.getByRole("button", { name: "Remove" }));
    expect(rendered.getByTestId("value")).toHaveTextContent('"seed"');
  });

  it("retains state but catches values that cannot be serialized", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    let controller!: ReturnType<typeof createLocalStorage<object>>;
    const Harness = () => {
      controller = createLocalStorage({ key: "circular", initialValue: {} });
      return null;
    };
    render(() => <Harness />);
    const circular: { self?: unknown } = {};
    circular.self = circular;

    expect(() => controller.setState(circular)).not.toThrow();
    expect(controller.state()).toBe(circular);
    expect(warn).toHaveBeenCalledWith(
      'createStorage: failed to serialize "circular"',
      expect.anything(),
    );
  });
});

describe("[CSR] createSessionStorage lifecycle", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("closes its owner-scoped BroadcastChannel on cleanup", () => {
    const close = vi.fn();
    class BroadcastChannelMock {
      addEventListener = vi.fn();
      postMessage = vi.fn();
      close = close;
    }
    vi.stubGlobal("BroadcastChannel", BroadcastChannelMock);

    const Harness = () => {
      createSessionStorage({ key: "session", initialValue: "seed" });
      return null;
    };
    const rendered = render(() => <Harness />);
    rendered.unmount();

    expect(close).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });
});
