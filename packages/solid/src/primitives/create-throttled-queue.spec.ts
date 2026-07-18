import { createRoot } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createThrottledQueue, ThrottledQueue } from "./create-throttled-queue";

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("ThrottledQueue", () => {
  it("always defers tasks and resolves their return values", async () => {
    vi.useFakeTimers();
    const queue = new ThrottledQueue(0);
    const task = vi.fn(async () => 42);

    const result = queue.push(task);
    await Promise.resolve();
    expect(task).not.toHaveBeenCalled();

    await vi.runAllTimersAsync();
    await expect(result).resolves.toBe(42);
  });

  it("runs tasks in FIFO order and waits from completion to the next start", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const queue = new ThrottledQueue(100);
    const starts: Array<[number, number]> = [];

    const first = queue.push(async () => {
      starts.push([1, Date.now()]);
    });
    const second = queue.push(async () => {
      starts.push([2, Date.now()]);
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(starts).toEqual([[1, 1000]]);
    await vi.advanceTimersByTimeAsync(99);
    expect(starts).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);

    await Promise.all([first, second]);
    expect(starts).toEqual([
      [1, 1000],
      [2, 1100],
    ]);
  });

  it("continues draining after a task rejects", async () => {
    vi.useFakeTimers();
    const queue = new ThrottledQueue(0);
    const failed = queue.push(async () => {
      throw new Error("failed");
    });
    const failedRejection = expect(failed).rejects.toThrow("failed");
    const next = queue.push(async () => "next");

    await vi.runAllTimersAsync();

    await failedRejection;
    await expect(next).resolves.toBe("next");
  });

  it("rejects pending and future work after destruction", async () => {
    vi.useFakeTimers();
    const queue = new ThrottledQueue();
    const pending = queue.push(async () => "pending");
    const rejection = expect(pending).rejects.toThrow("stopped");

    queue.destroy("stopped");

    await rejection;
    await expect(queue.push(async () => "future")).rejects.toThrow(
      /destroyed/i,
    );
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("createThrottledQueue", () => {
  it("requires an owner and destroys pending work when that owner is disposed", async () => {
    vi.useFakeTimers();
    expect(() => createThrottledQueue()).toThrow(/owner/i);

    let dispose!: () => void;
    let queue!: ThrottledQueue;
    createRoot((rootDispose) => {
      dispose = rootDispose;
      queue = createThrottledQueue();
    });

    const pending = queue.push(async () => "pending");
    const rejection = expect(pending).rejects.toThrow("owner disposed");
    dispose();

    await rejection;
    expect(vi.getTimerCount()).toBe(0);
  });
});
