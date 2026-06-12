import { describe, expect, test } from "vitest";

import { ThrottledQueue } from "./use-throttled-queue";

describe("ThrottledQueue", () => {
  // -------------------------------------------------------------------------
  // Regression pin: even with `minInterval = 0`, `push(fn)` defers `fn`
  // execution behind a `setTimeout(..., 0)` tick — i.e. the queue is
  // asynchronous by construction, never inline-synchronous.
  //
  // This is the current contract. It keeps the scheduling model uniform:
  // callers always see "queued then fired" ordering, no matter the
  // interval. If someone later optimizes the 0-interval case by inline-
  // firing the task (skipping setTimeout), this test breaks and forces an
  // explicit decision about whether that contract change is acceptable.
  // -------------------------------------------------------------------------
  test("minInterval=0 still defers fn behind a setTimeout tick (async by construction)", async () => {
    const q = new ThrottledQueue(0);
    let ran = false;

    const promise = q.push(async () => {
      ran = true;
    });

    // Flush one microtask. With the current implementation `fn` is gated
    // behind a setTimeout (a macrotask), so it has NOT run yet.
    await Promise.resolve();
    expect(ran).toBe(false);

    // Awaiting the returned promise lets the macrotask fire and `fn` run.
    await promise;
    expect(ran).toBe(true);
  });

  test("multiple pushes resolve in FIFO order", async () => {
    const q = new ThrottledQueue(0);
    const order: number[] = [];

    const p1 = q.push(async () => {
      order.push(1);
    });
    const p2 = q.push(async () => {
      order.push(2);
    });
    const p3 = q.push(async () => {
      order.push(3);
    });

    await Promise.all([p1, p2, p3]);

    expect(order).toEqual([1, 2, 3]);
  });

  test("push() resolves with the fn's return value", async () => {
    const q = new ThrottledQueue(0);
    const value = await q.push(async () => 42);
    expect(value).toBe(42);
  });

  test("destroy() rejects pending tasks and refuses new ones", async () => {
    const q = new ThrottledQueue(10);

    // Push two tasks; only the first one (at most) will run before destroy.
    const p1 = q.push(async () => "first");
    const p2 = q.push(async () => "second");

    q.destroy();

    // The new push must reject — queue is destroyed.
    await expect(q.push(async () => "after")).rejects.toThrow(/destroyed/i);

    // Both pending tasks reject. (The very first one may already have been
    // scheduled — either way, after destroy() both promises settle as
    // rejections with the destroyed reason.)
    await expect(Promise.all([p1, p2])).rejects.toThrow();
  });
});
