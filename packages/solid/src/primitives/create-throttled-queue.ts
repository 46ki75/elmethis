import { getOwner, onCleanup } from "solid-js";

interface QueueEntry {
  run: () => Promise<void>;
  reject: (reason: unknown) => void;
}

/** A universal FIFO queue that spaces task starts from prior task completion. */
export class ThrottledQueue {
  private readonly queue: QueueEntry[] = [];
  private readonly minInterval: number;
  private lastFinishedAt = 0;
  private running = false;
  private destroyed = false;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(minInterval = 200) {
    this.minInterval = Math.max(0, minInterval);
  }

  push<T>(task: () => Promise<T>): Promise<T> {
    if (this.destroyed) {
      return Promise.reject(new Error("ThrottledQueue is destroyed"));
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        run: async () => {
          try {
            resolve(await task());
          } catch (error) {
            reject(error);
          }
        },
        reject,
      });
      this.drain();
    });
  }

  destroy(reason = "ThrottledQueue destroyed"): void {
    if (this.destroyed) return;
    this.destroyed = true;

    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    const error = new Error(reason);
    for (const entry of this.queue.splice(0)) entry.reject(error);
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
      this.timer = undefined;
      if (this.destroyed) return;

      const entry = this.queue.shift();
      if (!entry) return;
      await entry.run();
      this.lastFinishedAt = Date.now();
      this.scheduleNext();
    }, delay);
  }
}

/** Creates a queue that rejects pending tasks when its Solid owner is disposed. */
export function createThrottledQueue(minInterval = 200): ThrottledQueue {
  if (!getOwner()) {
    throw new Error("createThrottledQueue requires a reactive owner");
  }

  const queue = new ThrottledQueue(minInterval);
  onCleanup(() => queue.destroy("owner disposed"));
  return queue;
}
