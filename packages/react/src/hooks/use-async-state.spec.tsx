import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

import { useAsyncState } from "./use-async-state";

// ---------------------------------------------------------------------------
// Controllable promise queue
// ---------------------------------------------------------------------------
//
// The wrapper's `promise` pulls one deferred off the front of this module-
// level queue per `execute()` call, so the test body can resolve them in any
// order to simulate out-of-order completion.

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
};

const deferredQueue: Deferred<string>[] = [];

// Captures the promises returned by `execute()` so the test body can await
// them and observe what each individual call resolves with — separate from
// the surface-level `state`. Used by the stale-resolve regression test below.
const promiseQueue: Promise<string | undefined>[] = [];

const newDeferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const resetQueue = () => {
  deferredQueue.length = 0;
  promiseQueue.length = 0;
};

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

// ---------------------------------------------------------------------------
// Wrapper components
// ---------------------------------------------------------------------------

/**
 * Each click of `#exec` pushes a fresh deferred onto `deferredQueue` and
 * returns its promise. The test then resolves entries from `deferredQueue`
 * in whatever order it wants.
 */
const RaceWrapper = () => {
  const { state, execute, isLoading } = useAsyncState<string>(
    () => {
      const d = newDeferred<string>();
      deferredQueue.push(d);
      return d.promise;
    },
    "initial",
    { immediate: false },
  );
  return (
    <div>
      <span data-testid="state">{state}</span>
      <span data-testid="loading">{String(isLoading)}</span>
      <button
        data-testid="exec"
        onClick={() => {
          // Discard the returned promise — we resolve the deferred ourselves.
          void execute();
        }}
      >
        Exec
      </button>
    </div>
  );
};

/**
 * Same as RaceWrapper but publishes the promise returned by each
 * `execute()` into `promiseQueue` so tests can observe what individual
 * callers see, independent of the `state`.
 */
const CapturingWrapper = () => {
  const { execute } = useAsyncState<string>(
    () => {
      const d = newDeferred<string>();
      deferredQueue.push(d);
      return d.promise;
    },
    "initial",
    { immediate: false },
  );
  return (
    <button
      data-testid="exec"
      onClick={() => {
        promiseQueue.push(execute());
      }}
    >
      Exec
    </button>
  );
};

// ---------------------------------------------------------------------------
// [CSR]
// ---------------------------------------------------------------------------

describe("[CSR] useAsyncState concurrency", () => {
  beforeEach(() => {
    resetQueue();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  test("a single execute resolves and updates state", async () => {
    render(<RaceWrapper />);

    fireEvent.click(screen.getByTestId("exec"));

    expect(deferredQueue.length).toBe(1);
    deferredQueue[0].resolve("first");
    await flush();

    expect(screen.getByTestId("state").textContent).toBe("first");
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  // -------------------------------------------------------------------------
  // Repro: two execute() calls overlap.
  //
  // Imagine a search-as-you-type box: the user fires request 1, then
  // immediately fires request 2 with a newer query. The server replies to
  // request 2 first (it was cheap), then to request 1 (it was slow). Without
  // a generation guard, request 1's stale data overwrites request 2's fresh
  // data, and the UI shows results for the old query.
  // -------------------------------------------------------------------------
  test("late-arriving result of an older execute must not clobber a newer one", async () => {
    render(<RaceWrapper />);

    // Two overlapping calls.
    fireEvent.click(screen.getByTestId("exec"));
    fireEvent.click(screen.getByTestId("exec"));

    expect(deferredQueue.length).toBe(2);

    // The second (newer) call wins by resolving first with "new".
    deferredQueue[1].resolve("new");
    await flush();
    expect(screen.getByTestId("state").textContent).toBe("new");

    // The first (older) call now resolves later with "old". It must be
    // discarded — state must remain "new".
    deferredQueue[0].resolve("old");
    await flush();
    expect(screen.getByTestId("state").textContent).toBe("new");
  });

  test("late-arriving error of an older execute must not clobber a newer success", async () => {
    render(<RaceWrapper />);

    fireEvent.click(screen.getByTestId("exec"));
    fireEvent.click(screen.getByTestId("exec"));

    deferredQueue[1].resolve("new");
    await flush();
    expect(screen.getByTestId("state").textContent).toBe("new");

    // Old call rejects after the newer one already succeeded.
    deferredQueue[0].reject(new Error("stale failure"));
    await flush();

    // State stays at the newer success, not reset by the stale rejection.
    expect(screen.getByTestId("state").textContent).toBe("new");
  });

  // -------------------------------------------------------------------------
  // Regression pin: when an older execute() is invalidated by a newer one
  // and only later resolves, the *promise returned to the original caller*
  // still resolves with the (stale) data. The hook only protects the public
  // `state` / `error` / `isLoading` values from clobbering; it does not
  // reject or hide the stale value from whoever awaited that specific
  // promise.
  //
  // This is a deliberate behavior choice: rejecting the older promise would
  // require choosing an error type and might surprise callers using
  // `execute().then(...)`. Pinning it here so that if we ever decide to
  // change the contract (e.g. resolve stale calls with `undefined`), this
  // test flags the semantic shift loudly.
  // -------------------------------------------------------------------------
  test("stale execute() still resolves to its original caller with the stale data", async () => {
    render(<CapturingWrapper />);

    fireEvent.click(screen.getByTestId("exec"));
    fireEvent.click(screen.getByTestId("exec"));
    expect(promiseQueue.length).toBe(2);
    expect(deferredQueue.length).toBe(2);

    // Newer call resolves first.
    deferredQueue[1].resolve("new");
    // Older call resolves later — it is "stale" by then.
    deferredQueue[0].resolve("old");

    // Both promises observable to their original callers still resolve
    // (neither rejects), and each one resolves with the value its own
    // promise returned — including the stale one.
    await expect(promiseQueue[1]).resolves.toBe("new");
    await expect(promiseQueue[0]).resolves.toBe("old");
  });
});
