import {
  $,
  type QRL,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@qwik.dev/core";

export interface UseAsyncStateOptions<D = unknown> {
  /**
   * Delay for the first execution when `immediate` is true (in milliseconds).
   * @default 0
   */
  delay?: number;

  /**
   * Execute the promise immediately after the hook is initialized on the client.
   * @default true
   */
  immediate?: boolean;

  /**
   * Callback when an error is caught.
   */
  onError$?: QRL<(e: unknown) => void>;

  /**
   * Callback when the promise resolves successfully.
   */
  onSuccess$?: QRL<(data: D) => void>;

  /**
   * Reset state to the initial value before each execution.
   * @default true
   */
  resetOnExecute?: boolean;

  /**
   * Re-throw errors from `execute`.
   * @default false
   */
  throwError?: boolean;
}

/**
 * Reactive async state that runs only on the client side.
 * Resembles VueUse's `useAsyncState` interface.
 *
 * Concurrency: when `execute` is called while a prior call is still in
 * flight, the prior call's resolution / rejection is **discarded**. Without
 * this guard the older call's result could land after the newer one and
 * silently overwrite the up-to-date state (classic search-as-you-type
 * staleness bug).
 *
 * @param promise$ - QRL wrapping the async function to execute.
 * @param initialState - The initial state used until the promise resolves.
 * @param options - Configuration options.
 */
export const useAsyncState = <Data,>(
  promise$: QRL<() => Promise<Data>>,
  initialState: Data,
  options?: UseAsyncStateOptions<Data>,
) => {
  const onError$ = options?.onError$;
  const onSuccess$ = options?.onSuccess$;
  // Wrapped in a store so the boolean fields are serializable when captured
  // into the execute QRL and the mount visible-task. Pulling raw locals out
  // of `options?` makes them flow through a type the optimizer sees as
  // possibly-Symbol (because `options` also carries QRL fields), tripping
  // `qwik/valid-lexical-scope`.
  const config = useStore({
    immediate: options?.immediate ?? true,
    delay: options?.delay ?? 0,
    resetOnExecute: options?.resetOnExecute ?? true,
    throwError: options?.throwError ?? false,
  });

  const state = useSignal<Data>(initialState);
  const isReady = useSignal(false);
  const isLoading = useSignal(false);
  const error = useSignal<unknown>(undefined);
  // Generation counter: each execute() captures its own generation and only
  // commits results when its capture still matches the current value. A
  // newer execute() bumps the counter, invalidating any in-flight older call.
  const execGen = useSignal(0);

  const execute: QRL<(delay?: number) => Promise<Data | undefined>> = $(
    async (execDelay = 0) => {
      const myGen = ++execGen.value;

      if (config.resetOnExecute) {
        state.value = initialState;
      }
      error.value = undefined;
      isReady.value = false;
      isLoading.value = true;

      if (execDelay > 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, execDelay));
      }

      try {
        const data = await promise$();
        if (myGen !== execGen.value) {
          // Stale: a newer execute() has taken over. Drop the result.
          return data;
        }
        state.value = data;
        isReady.value = true;
        if (onSuccess$) {
          await onSuccess$(data);
        }
        return data;
      } catch (e) {
        if (myGen !== execGen.value) {
          // Stale error: a newer execute() has already overwritten state.
          // Swallow it (no signal writes, no callback, no rethrow) so the
          // newer call's success isn't undone.
          return;
        }
        error.value = e;
        if (onError$) {
          await onError$(e);
        }
        if (config.throwError) {
          throw e;
        }
      } finally {
        // Only the current generation is allowed to flip isLoading off — a
        // stale call's `finally` would otherwise hide the newer call's
        // in-flight state.
        if (myGen === execGen.value) {
          isLoading.value = false;
        }
      }
    },
  );

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    async () => {
      if (config.immediate) {
        await execute(config.delay);
      }
    },
    { strategy: "document-ready" },
  );

  return { state, isReady, isLoading, error, execute };
};
