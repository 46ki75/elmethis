import { $, component$ } from "@qwik.dev/core";
import { createDOM } from "@qwik.dev/core/testing";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useAsyncState } from "./use-async-state";

// ---------------------------------------------------------------------------
// Controllable promise queue
// ---------------------------------------------------------------------------
//
// The wrapper's `promise$` pulls one deferred off the front of this module-
// level queue per `execute()` call, so the test body can resolve them in any
// order to simulate out-of-order completion.

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
};

const deferredQueue: Deferred<string>[] = [];

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
};

// ---------------------------------------------------------------------------
// Wrapper component
// ---------------------------------------------------------------------------

/**
 * Each click of `#exec` pushes a fresh deferred onto `deferredQueue` and
 * returns its promise. The test then resolves entries from `deferredQueue`
 * in whatever order it wants.
 */
const RaceWrapper = component$(() => {
  const { state, execute, isLoading } = useAsyncState<string>(
    $(() => {
      const d = newDeferred<string>();
      deferredQueue.push(d);
      return d.promise;
    }),
    "initial",
    { immediate: false },
  );
  return (
    <div>
      <span id="state">{state.value}</span>
      <span id="loading">{String(isLoading.value)}</span>
      <button
        id="exec"
        onClick$={() => {
          // Discard the returned promise so userEvent doesn't await the
          // entire execute() lifecycle — we resolve the deferred ourselves.
          void execute();
        }}
      >
        Exec
      </button>
    </div>
  );
});

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
    const { screen, render, userEvent } = await createDOM();
    await render(<RaceWrapper />);

    await userEvent("#exec", "click");

    expect(deferredQueue.length).toBe(1);
    deferredQueue[0].resolve("first");
    // Let the awaited resolution and any post-state writes flush.
    await new Promise((r) => setTimeout(r, 0));

    expect(screen.querySelector("#state")!.textContent).toBe("first");
    expect(screen.querySelector("#loading")!.textContent).toBe("false");
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
    const { screen, render, userEvent } = await createDOM();
    await render(<RaceWrapper />);

    // Two overlapping calls.
    await userEvent("#exec", "click");
    await userEvent("#exec", "click");

    expect(deferredQueue.length).toBe(2);

    // The second (newer) call wins by resolving first with "new".
    deferredQueue[1].resolve("new");
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.querySelector("#state")!.textContent).toBe("new");

    // The first (older) call now resolves later with "old". It must be
    // discarded — state must remain "new".
    deferredQueue[0].resolve("old");
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.querySelector("#state")!.textContent).toBe("new");
  });

  test("late-arriving error of an older execute must not clobber a newer success", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<RaceWrapper />);

    await userEvent("#exec", "click");
    await userEvent("#exec", "click");

    deferredQueue[1].resolve("new");
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.querySelector("#state")!.textContent).toBe("new");

    // Old call rejects after the newer one already succeeded.
    deferredQueue[0].reject(new Error("stale failure"));
    await new Promise((r) => setTimeout(r, 0));

    // State stays at the newer success, not reset by the stale rejection.
    expect(screen.querySelector("#state")!.textContent).toBe("new");
  });
});
