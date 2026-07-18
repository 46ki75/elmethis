import { render } from "@solidjs/testing-library";
import { createSignal, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmModal } from "./elm-modal";

describe("[Browser] ElmModal", () => {
  it("opens natively, ignores content clicks, and closes from its backdrop", async () => {
    const Harness = () => {
      const [isOpen, setIsOpen] = createSignal(false);
      const [closeCount, setCloseCount] = createSignal(0);

      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open
          </button>
          <output data-testid="close-count">{closeCount()}</output>
          <ElmModal
            isOpen={isOpen()}
            delay={0}
            onClose={() => {
              setCloseCount((count) => count + 1);
              setIsOpen(false);
            }}
          >
            <button type="button">Inside</button>
          </ElmModal>
        </>
      );
    };
    const rendered = render(() => <Harness />);
    const dialog = rendered.container.querySelector("dialog")!;

    rendered.getByRole("button", { name: "Open" }).click();
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    await vi.waitFor(() => expect(dialog.className).toMatch(/shown/));

    rendered.getByRole("button", { name: "Inside" }).click();
    expect(rendered.getByTestId("close-count")).toHaveTextContent("0");
    expect(dialog.open).toBe(true);

    dialog.click();
    await vi.waitFor(() => expect(dialog.open).toBe(false));
    expect(rendered.getByTestId("close-count")).toHaveTextContent("1");
  });

  it("cancels a pending close when reopened and preserves the dialog node", async () => {
    const Harness = () => {
      const [isOpen, setIsOpen] = createSignal(false);
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open
          </button>
          <ElmModal isOpen={isOpen()} delay={80}>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                queueMicrotask(() => setIsOpen(true));
              }}
            >
              Close and reopen
            </button>
          </ElmModal>
        </>
      );
    };
    const rendered = render(() => <Harness />);
    const dialog = rendered.container.querySelector("dialog")!;

    rendered.getByRole("button", { name: "Open" }).click();
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    rendered.getByRole("button", { name: "Close and reopen" }).click();

    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(dialog.open).toBe(true);
    expect(rendered.container.querySelector("dialog")).toBe(dialog);
    expect(dialog.className).toMatch(/shown/);
  });

  it("cancels and rearms the close timer when delay changes", async () => {
    const Harness = () => {
      const [isOpen, setIsOpen] = createSignal(false);
      const [delay, setDelay] = createSignal(60);
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open
          </button>
          <ElmModal isOpen={isOpen()} delay={delay()}>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setTimeout(() => setDelay(180), 20);
              }}
            >
              Close slowly
            </button>
          </ElmModal>
        </>
      );
    };
    const rendered = render(() => <Harness />);
    const dialog = rendered.container.querySelector("dialog")!;

    rendered.getByRole("button", { name: "Open" }).click();
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    rendered.getByRole("button", { name: "Close slowly" }).click();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(dialog.open).toBe(true);
    await vi.waitFor(() => expect(dialog.open).toBe(false), { timeout: 500 });
  });

  it("reconciles native cancel and unexpected close events", async () => {
    const Harness = () => {
      const [isOpen, setIsOpen] = createSignal(false);
      const [closeCount, setCloseCount] = createSignal(0);
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open
          </button>
          <output data-testid="close-count">{closeCount()}</output>
          <ElmModal
            isOpen={isOpen()}
            delay={0}
            onClose={() => {
              setCloseCount((count) => count + 1);
              setIsOpen(false);
            }}
          />
        </>
      );
    };
    const rendered = render(() => <Harness />);
    const dialog = rendered.container.querySelector("dialog")!;
    const open = rendered.getByRole("button", { name: "Open" });

    open.click();
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    const cancel = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
    await vi.waitFor(() => expect(dialog.open).toBe(false));
    expect(rendered.getByTestId("close-count")).toHaveTextContent("1");

    open.click();
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    dialog.close();
    await vi.waitFor(() =>
      expect(rendered.getByTestId("close-count")).toHaveTextContent("2"),
    );
    expect(dialog.open).toBe(false);
  });

  it("cancels a pending close timer when unmounted", async () => {
    const close = vi.spyOn(HTMLDialogElement.prototype, "close");
    const Harness = () => {
      const [mounted, setMounted] = createSignal(true);
      const [isOpen, setIsOpen] = createSignal(false);
      return (
        <Show when={mounted()}>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open
          </button>
          <ElmModal isOpen={isOpen()} delay={50}>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setMounted(false);
              }}
            >
              Remove
            </button>
          </ElmModal>
        </Show>
      );
    };
    const rendered = render(() => <Harness />);

    rendered.getByRole("button", { name: "Open" }).click();
    const dialog = rendered.container.querySelector("dialog")!;
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    rendered.getByRole("button", { name: "Remove" }).click();
    await new Promise((resolve) => setTimeout(resolve, 80));

    expect(rendered.container.querySelector("dialog")).toBeNull();
    expect(close).not.toHaveBeenCalled();
    close.mockRestore();
  });
});
