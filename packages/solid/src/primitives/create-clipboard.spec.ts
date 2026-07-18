import { createRoot, createSignal } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createClipboard } from "./create-clipboard";

describe("[CSR] createClipboard", () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(
    Navigator.prototype,
    "clipboard",
  );
  const OriginalClipboardItem = globalThis.ClipboardItem;
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText, write: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    if (originalClipboard) {
      Object.defineProperty(
        Navigator.prototype,
        "clipboard",
        originalClipboard,
      );
    } else {
      Reflect.deleteProperty(navigator, "clipboard");
    }
    globalThis.ClipboardItem = OriginalClipboardItem;
  });

  it("writes the latest text and marks copied only after success", async () => {
    const [content, setContent] = createSignal("first");
    const controller = createRoot(() =>
      createClipboard({
        get content() {
          return content();
        },
      }),
    );
    let resolveWrite: (() => void) | undefined;
    writeText.mockImplementation(
      () => new Promise<void>((resolve) => (resolveWrite = resolve)),
    );

    setContent("latest");
    const pending = controller.copy();

    expect(writeText).toHaveBeenCalledWith("latest");
    expect(controller.copied()).toBe(false);

    resolveWrite?.();
    await pending;
    expect(controller.copied()).toBe(true);
  });

  it("replaces the active reset timer after another successful copy", async () => {
    const controller = createRoot(() =>
      createClipboard({ content: "copy", delay: 100 }),
    );

    await controller.copy();
    await vi.advanceTimersByTimeAsync(75);
    await controller.copy();
    await vi.advanceTimersByTimeAsync(50);
    expect(controller.copied()).toBe(true);

    await vi.advanceTimersByTimeAsync(50);
    expect(controller.copied()).toBe(false);
  });

  it("rejects failed writes without entering copied state", async () => {
    writeText.mockRejectedValueOnce(
      new DOMException("denied", "NotAllowedError"),
    );
    const controller = createRoot(() =>
      createClipboard({ content: "copy", delay: 100 }),
    );

    await expect(controller.copy()).rejects.toMatchObject({
      name: "NotAllowedError",
    });
    expect(controller.copied()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("constructs ClipboardItems for compatible record content", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    const items: unknown[] = [];
    class ClipboardItemMock {
      constructor(value: unknown) {
        items.push(value);
      }
    }
    globalThis.ClipboardItem =
      ClipboardItemMock as unknown as typeof ClipboardItem;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText, write },
    });
    const content = [{ "text/plain": new Blob(["rich"]) }];
    const controller = createRoot(() => createClipboard({ content }));

    await controller.copy();

    expect(items).toEqual(content);
    expect(write).toHaveBeenCalledOnce();
    expect(write.mock.calls[0]?.[0]).toHaveLength(1);
  });

  it("clears its timer and ignores writes that settle after disposal", async () => {
    let dispose: () => void = () => {};
    const controller = createRoot((rootDispose) => {
      dispose = rootDispose;
      return createClipboard({ content: "copy" });
    });

    await controller.copy();
    expect(vi.getTimerCount()).toBe(1);
    dispose();
    expect(vi.getTimerCount()).toBe(0);

    let resolveWrite: (() => void) | undefined;
    writeText.mockImplementationOnce(
      () => new Promise<void>((resolve) => (resolveWrite = resolve)),
    );
    const lateController = createRoot((rootDispose) => {
      dispose = rootDispose;
      return createClipboard({ content: "late" });
    });
    const pending = lateController.copy();
    dispose();
    resolveWrite?.();
    await pending;

    expect(lateController.copied()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});
