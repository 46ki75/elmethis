export const CODEX_IMAGE_RUN_LIMITS = {
  maxImages: 20,
  maxImageBytes: 5 * 1024 * 1024,
  maxBytes: 20 * 1024 * 1024,
  maxConcurrentDownloads: 4,
} as const;

interface ImageRunLimits {
  maxImages: number;
  maxImageBytes?: number;
  maxBytes: number;
  maxConcurrentDownloads: number;
}
type ImageResolver = (
  url: string,
  signal: AbortSignal,
  maxBytes: number,
) => Promise<string>;
type RunImageResolver = (url: string) => Promise<string>;
interface Waiter {
  signal: AbortSignal;
  resolve: (allowance: number) => void;
  reject: (reason: unknown) => void;
  onAbort: () => void;
}

function imageBytes(value: string): number {
  const encoded =
    /^data:image\/(?:png|jpeg|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/i.exec(
      value,
    )?.[1];
  if (!encoded) {
    throw new Error("Codex image resolver did not return an inline image");
  }
  const padding = encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0;
  return Math.floor((encoded.length * 3) / 4) - padding;
}

export function createRunImageResolver(
  resolver: ImageResolver,
  signal: AbortSignal,
  limits: ImageRunLimits = CODEX_IMAGE_RUN_LIMITS,
): RunImageResolver {
  const cache = new Map<string, Promise<string>>();
  const waiters: Waiter[] = [];
  const maximumReservation = Math.min(
    limits.maxImageBytes ?? CODEX_IMAGE_RUN_LIMITS.maxImageBytes,
    limits.maxBytes,
  );
  let images = 0;
  let bytes = 0;
  let reservedBytes = 0;
  let active = 0;
  let stopped = false;
  let stopReason: unknown;

  const aggregateError = () =>
    new Error(
      `Images exceed the ${String(limits.maxBytes / 1024 / 1024)} MiB aggregate per-run limit`,
    );
  const rejectQueued = (reason: unknown) => {
    for (const waiter of waiters.splice(0)) {
      waiter.signal.removeEventListener("abort", waiter.onAbort);
      waiter.reject(reason);
    }
  };
  const stop = (reason: unknown) => {
    if (!stopped) {
      stopped = true;
      stopReason = reason;
    }
    rejectQueued(stopReason);
  };
  const drain = () => {
    if (stopped) {
      rejectQueued(stopReason);
      return;
    }
    while (waiters.length && active < limits.maxConcurrentDownloads) {
      const available = limits.maxBytes - bytes - reservedBytes;
      // Wait for in-flight work to return unused reservations before assigning
      // a smaller allowance. Once none remains, the resolver can safely enforce
      // the exact final slice of the aggregate budget.
      const allowance =
        available >= maximumReservation
          ? maximumReservation
          : active === 0 && available > 0
            ? available
            : 0;
      if (allowance === 0) {
        break;
      }
      const waiter = waiters.shift()!;
      waiter.signal.removeEventListener("abort", waiter.onAbort);
      if (waiter.signal.aborted) {
        waiter.reject(waiter.signal.reason);
        continue;
      }
      active++;
      reservedBytes += allowance;
      waiter.resolve(allowance);
    }
    // With no active reservation left, no completion can free more capacity.
    if (waiters.length && active === 0) {
      stop(aggregateError());
    }
  };
  const acquire = () => {
    signal.throwIfAborted();
    if (stopped) {
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- Preserve a caller-supplied cancellation reason.
      return Promise.reject(stopReason);
    }
    return new Promise<number>((resolve, reject) => {
      const waiter: Waiter = {
        signal,
        resolve,
        reject,
        onAbort: () => {
          const index = waiters.indexOf(waiter);
          if (index !== -1) {
            waiters.splice(index, 1);
          }
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- Preserve AbortSignal's caller-supplied reason.
          reject(signal.reason);
        },
      };
      waiters.push(waiter);
      signal.addEventListener("abort", waiter.onAbort, { once: true });
      if (signal.aborted) {
        waiter.onAbort();
      } else {
        drain();
      }
    });
  };
  const release = (allowance: number) => {
    active--;
    reservedBytes -= allowance;
  };
  const finishSuccess = (allowance: number, size: number) => {
    release(allowance);
    if (stopped) {
      throw stopReason;
    }
    if (size > allowance || bytes + reservedBytes + size > limits.maxBytes) {
      const error = aggregateError();
      stop(error);
      throw error;
    }
    bytes += size;
    drain();
  };
  const finishFailure = (allowance: number, reason: unknown) => {
    release(allowance);
    stop(reason);
  };
  const resolveDistinct = (url: string, allowance: number): Promise<string> => {
    let pending = cache.get(url);
    if (!pending) {
      pending = resolver(url, signal, allowance);
      cache.set(url, pending);
    }
    return pending;
  };

  return async (url) => {
    images++;
    if (images > limits.maxImages) {
      const error = new Error(
        `Codex chat supports at most ${limits.maxImages} images per run`,
      );
      stop(error);
      throw error;
    }
    const allowance = await acquire();
    let finishing = false;
    try {
      signal.throwIfAborted();
      const image = await resolveDistinct(url, allowance);
      signal.throwIfAborted();
      const size = imageBytes(image);
      finishing = true;
      finishSuccess(allowance, size);
      return image;
    } catch (error) {
      if (!finishing) {
        finishFailure(allowance, error);
      }
      throw error;
    }
  };
}
