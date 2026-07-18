import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createLocalStorage, createSessionStorage } from "./create-storage";

const LocalPair = () => {
  const first = createLocalStorage<string | null>({
    key: "browser-local",
    initialValue: "seed",
  });
  const second = createLocalStorage<string | null>({
    key: "browser-local",
    initialValue: "seed",
  });
  return (
    <div>
      <output data-testid="first">{JSON.stringify(first.state())}</output>
      <output data-testid="second">{JSON.stringify(second.state())}</output>
      <button type="button" onClick={() => first.setState(null)}>
        Store null
      </button>
      <button type="button" onClick={first.remove}>
        Remove
      </button>
    </div>
  );
};

const SessionPair = () => {
  const first = createSessionStorage<string | null>({
    key: "browser-session",
    initialValue: "seed",
  });
  const second = createSessionStorage<string | null>({
    key: "browser-session",
    initialValue: "seed",
  });
  return (
    <div>
      <output data-testid="session-first">
        {JSON.stringify(first.state())}
      </output>
      <output data-testid="session-second">
        {JSON.stringify(second.state())}
      </output>
      <button type="button" onClick={() => first.setState(null)}>
        Session null
      </button>
      <button type="button" onClick={first.remove}>
        Session remove
      </button>
    </div>
  );
};

describe("[Browser] createLocalStorage", () => {
  beforeEach(() => localStorage.removeItem("browser-local"));
  afterEach(() => localStorage.removeItem("browser-local"));

  it("persists and synchronizes same-tab null and removal operations", async () => {
    const rendered = render(() => <LocalPair />);
    const screen = page.elementLocator(rendered.baseElement);

    await screen.getByRole("button", { name: "Store null" }).click();
    await vi.waitFor(() => {
      expect(rendered.getByTestId("first")).toHaveTextContent("null");
      expect(rendered.getByTestId("second")).toHaveTextContent("null");
    });
    expect(localStorage.getItem("browser-local")).toBe("null");

    await screen.getByRole("button", { name: "Remove" }).click();
    await vi.waitFor(() =>
      expect(rendered.getByTestId("second")).toHaveTextContent('"seed"'),
    );
    expect(localStorage.getItem("browser-local")).toBeNull();
  });
});

describe("[Browser] createSessionStorage", () => {
  const OriginalBroadcastChannel = globalThis.BroadcastChannel;
  let posts = 0;

  beforeEach(() => {
    posts = 0;
    sessionStorage.removeItem("browser-session");
    class CountingBroadcastChannel extends OriginalBroadcastChannel {
      postMessage(message: unknown): void {
        posts++;
        super.postMessage(message);
      }
    }
    globalThis.BroadcastChannel = CountingBroadcastChannel;
  });

  afterEach(() => {
    globalThis.BroadcastChannel = OriginalBroadcastChannel;
    sessionStorage.removeItem("browser-session");
  });

  it("uses tagged channel operations once without echoing received state", async () => {
    const rendered = render(() => <SessionPair />);
    const screen = page.elementLocator(rendered.baseElement);

    await screen.getByRole("button", { name: "Session null" }).click();
    await vi.waitFor(() =>
      expect(rendered.getByTestId("session-second")).toHaveTextContent("null"),
    );
    expect(sessionStorage.getItem("browser-session")).toBe("null");
    expect(posts).toBe(1);

    await screen.getByRole("button", { name: "Session remove" }).click();
    await vi.waitFor(() =>
      expect(rendered.getByTestId("session-second")).toHaveTextContent(
        '"seed"',
      ),
    );
    expect(sessionStorage.getItem("browser-session")).toBeNull();
    expect(posts).toBe(2);
  });
});
