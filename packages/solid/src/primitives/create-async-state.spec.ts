import { createRoot } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createAsyncState,
  type CreateAsyncStateReturn,
} from "./create-async-state";

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
};

const setup = <T>(
  task: () => Promise<T>,
  initialState: T,
  options: Parameters<typeof createAsyncState<T>>[2] = { immediate: false },
) => {
  let state!: CreateAsyncStateReturn<T>;
  let dispose!: () => void;
  createRoot((rootDispose) => {
    dispose = rootDispose;
    state = createAsyncState(task, initialState, options);
  });
  return { state, dispose };
};

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("createAsyncState", () => {
  it("executes automatically on client mount by default", async () => {
    const task = vi.fn(async () => "loaded");
    const { state, dispose } = setup(task, "initial", {});

    await Promise.resolve();
    await Promise.resolve();

    expect(task).toHaveBeenCalledOnce();
    expect(state.state()).toBe("loaded");
    expect(state.isReady()).toBe(true);
    dispose();
  });

  it("executes manually and exposes loading, ready, and success state", async () => {
    const request = deferred<string>();
    const onSuccess = vi.fn();
    const { state, dispose } = setup(() => request.promise, "initial", {
      immediate: false,
      onSuccess,
    });

    const result = state.execute();
    expect(state.state()).toBe("initial");
    expect(state.isLoading()).toBe(true);
    expect(state.isReady()).toBe(false);

    request.resolve("loaded");
    await expect(result).resolves.toBe("loaded");
    expect(state.state()).toBe("loaded");
    expect(state.isLoading()).toBe(false);
    expect(state.isReady()).toBe(true);
    expect(state.error()).toBeUndefined();
    expect(onSuccess).toHaveBeenCalledWith("loaded");
    dispose();
  });

  it("captures errors, invokes onError, and optionally rethrows", async () => {
    const error = new Error("failed");
    const onError = vi.fn();
    const handled = setup(
      async () => {
        throw error;
      },
      "initial",
      { immediate: false, onError },
    );

    await expect(handled.state.execute()).resolves.toBeUndefined();
    expect(handled.state.error()).toBe(error);
    expect(handled.state.isLoading()).toBe(false);
    expect(onError).toHaveBeenCalledWith(error);
    handled.dispose();

    const rethrown = setup(
      async () => {
        throw error;
      },
      "initial",
      { immediate: false, throwError: true },
    );
    await expect(rethrown.state.execute()).rejects.toBe(error);
    expect(rethrown.state.isLoading()).toBe(false);
    rethrown.dispose();
  });

  it("resets by default and preserves state when resetOnExecute is false", async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const requests = [first, second];
    const resetting = setup(() => requests.shift()!.promise, "initial");

    const firstRun = resetting.state.execute();
    first.resolve("loaded");
    await firstRun;
    const secondRun = resetting.state.execute();
    expect(resetting.state.state()).toBe("initial");
    second.resolve("new");
    await secondRun;
    resetting.dispose();

    const next = deferred<string>();
    const preserved = setup(() => next.promise, "initial", {
      immediate: false,
      resetOnExecute: false,
    });
    const loaded = preserved.state.execute();
    next.resolve("loaded");
    await loaded;
    const pending = deferred<string>();
    const executeAgain = setup(() => pending.promise, "loaded", {
      immediate: false,
      resetOnExecute: false,
    });
    void executeAgain.state.execute();
    expect(executeAgain.state.state()).toBe("loaded");
    preserved.dispose();
    executeAgain.dispose();
  });

  it("lets only the latest generation commit while stale callers keep their result", async () => {
    const oldRequest = deferred<string>();
    const newRequest = deferred<string>();
    const requests = [oldRequest, newRequest];
    const { state, dispose } = setup(
      () => requests.shift()!.promise,
      "initial",
    );

    const oldResult = state.execute();
    const newResult = state.execute();
    newRequest.resolve("new");
    await expect(newResult).resolves.toBe("new");
    oldRequest.resolve("old");
    await expect(oldResult).resolves.toBe("old");

    expect(state.state()).toBe("new");
    expect(state.isReady()).toBe(true);
    expect(state.isLoading()).toBe(false);
    dispose();
  });

  it("discards a stale rejection without hiding a newer in-flight execution", async () => {
    const oldRequest = deferred<string>();
    const newRequest = deferred<string>();
    const requests = [oldRequest, newRequest];
    const onError = vi.fn();
    const { state, dispose } = setup(
      () => requests.shift()!.promise,
      "initial",
      {
        immediate: false,
        onError,
      },
    );

    const oldResult = state.execute();
    const newResult = state.execute();
    oldRequest.reject(new Error("stale"));
    await expect(oldResult).resolves.toBeUndefined();
    expect(state.isLoading()).toBe(true);
    expect(state.error()).toBeUndefined();
    expect(onError).not.toHaveBeenCalled();

    newRequest.resolve("new");
    await newResult;
    expect(state.state()).toBe("new");
    dispose();
  });

  it("delays execution and settles delayed work without running it after disposal", async () => {
    vi.useFakeTimers();
    const task = vi.fn(async () => "loaded");
    const { state, dispose } = setup(task, "initial");
    const result = state.execute(100);

    expect(state.isLoading()).toBe(true);
    expect(task).not.toHaveBeenCalled();
    dispose();

    await expect(result).resolves.toBeUndefined();
    expect(task).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
