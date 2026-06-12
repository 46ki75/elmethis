import { useEffect, useRef } from "react";

type Entry = { task: () => Promise<void>; reject: (err: unknown) => void };

export class ThrottledQueue {
  private readonly queue: Entry[] = [];
  private lastFinishedAt = 0;
  private running = false;
  private destroyed = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly minInterval: number;

  constructor(minInterval = 200) {
    this.minInterval = minInterval;
  }

  push<T>(fn: () => Promise<T>): Promise<T> {
    if (this.destroyed)
      return Promise.reject(new Error("ThrottledQueue is destroyed"));

    return new Promise((resolve, reject) => {
      this.queue.push({
        task: async () => {
          try {
            resolve(await fn());
          } catch (err) {
            reject(err);
          }
        },
        reject,
      });
      this.drain();
    });
  }

  destroy(reason = "ThrottledQueue destroyed"): void {
    this.destroyed = true;

    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const error = new Error(reason);
    for (const { reject } of this.queue.splice(0)) {
      reject(error);
    }

    this.running = false;
  }

  private drain(): void {
    if (this.running || this.destroyed) return;
    this.running = true;
    this.scheduleNext();
  }

  private scheduleNext(): void {
    if (this.queue.length === 0 || this.destroyed) {
      this.running = false;
      return;
    }

    const elapsed = Date.now() - this.lastFinishedAt;
    const delay = Math.max(0, this.minInterval - elapsed);

    this.timer = setTimeout(async () => {
      this.timer = null;
      const { task } = this.queue.shift()!;
      await task();
      this.lastFinishedAt = Date.now();
      this.scheduleNext();
    }, delay);
  }
}

/**
 * Client-side throttled task queue.
 *
 * React port of qwik's `useThrottledQueue`. Qwik returned a
 * `Signal<NoSerialize<ThrottledQueue>>` instantiated in a mount-time
 * `useVisibleTask$`. React has no signal/serialization model, so the queue is
 * held in a ref and created on mount via `useEffect` (which, like
 * `useVisibleTask$`, only runs on the client). The hook returns the
 * `ThrottledQueue` instance directly.
 *
 * The queue is created lazily on first client render and destroyed on unmount,
 * rejecting any still-pending tasks.
 *
 * @example
 *   const queue = useThrottledQueue(200);
 *   await queue?.push(async () => doWork());
 */
export function useThrottledQueue(minInterval = 200): ThrottledQueue | null {
  const queueRef = useRef<ThrottledQueue | null>(null);

  if (queueRef.current === null) {
    queueRef.current = new ThrottledQueue(minInterval);
  }

  useEffect(() => {
    // Recreate if a prior effect destroyed it (e.g. StrictMode double-mount).
    if (queueRef.current === null) {
      queueRef.current = new ThrottledQueue(minInterval);
    }

    const queue = queueRef.current;
    return () => {
      queue?.destroy("component unmounted");
      queueRef.current = null;
    };
    // Mirror the qwik mount-time visible-task: set up once on the client.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The queue is lazily created above and only nulled on unmount cleanup, so
  // reading `.current` here returns the live instance for this render.
  // eslint-disable-next-line react-hooks/refs
  return queueRef.current;
}
