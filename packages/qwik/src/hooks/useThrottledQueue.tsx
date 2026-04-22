import {
  useSignal,
  useVisibleTask$,
  noSerialize,
  type NoSerialize,
} from "@builder.io/qwik";

type Entry = { task: () => Promise<void>; reject: (err: unknown) => void };

export class ThrottledQueue {
  private readonly queue: Entry[] = [];
  private lastFinishedAt = 0;
  private running = false;
  private destroyed = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly minInterval = 200) {}

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

export function useThrottledQueue(minInterval = 200) {
  const queueRef = useSignal<NoSerialize<ThrottledQueue>>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    queueRef.value = noSerialize(new ThrottledQueue(minInterval));

    cleanup(() => {
      queueRef.value?.destroy("component unmounted");
    });
  });

  return queueRef;
}
