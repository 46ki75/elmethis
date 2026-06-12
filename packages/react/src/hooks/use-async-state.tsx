import { useCallback, useEffect, useRef, useState } from "react";

export interface UseAsyncStateOptions<D = unknown> {
  /**
   * Delay for the first execution when `immediate` is true (in milliseconds).
   * @default 0
   */
  delay?: number;

  /**
   * Execute the promise immediately after the hook is mounted on the client.
   * @default true
   */
  immediate?: boolean;

  /**
   * Callback when an error is caught.
   */
  onError?: (e: unknown) => void;

  /**
   * Callback when the promise resolves successfully.
   */
  onSuccess?: (data: D) => void;

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

export interface UseAsyncStateReturn<Data> {
  /** The current state. Initialized with `initialState` until the promise resolves. */
  state: Data;
  /** `true` once the promise has resolved successfully at least once for the latest call. */
  isReady: boolean;
  /** `true` while a promise is in flight. */
  isLoading: boolean;
  /** The error caught from the latest execution, if any. */
  error: unknown;
  /** Manually trigger an execution, optionally delayed by `execDelay` ms. */
  execute: (execDelay?: number) => Promise<Data | undefined>;
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
 * @param promise - The async function to execute.
 * @param initialState - The initial state used until the promise resolves.
 * @param options - Configuration options.
 */
export const useAsyncState = <Data,>(
  promise: () => Promise<Data>,
  initialState: Data,
  options?: UseAsyncStateOptions<Data>,
): UseAsyncStateReturn<Data> => {
  const immediate = options?.immediate ?? true;
  const delay = options?.delay ?? 0;
  const resetOnExecute = options?.resetOnExecute ?? true;
  const throwError = options?.throwError ?? false;

  const [state, setState] = useState<Data>(initialState);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(undefined);

  // Latest values captured into the stable `execute` callback so it never
  // needs to be re-created and stays referentially stable across renders.
  const promiseRef = useRef(promise);
  const onSuccessRef = useRef(options?.onSuccess);
  const onErrorRef = useRef(options?.onError);
  const initialStateRef = useRef(initialState);
  const resetOnExecuteRef = useRef(resetOnExecute);
  const throwErrorRef = useRef(throwError);

  // Sync the latest values into refs after each commit so the stable
  // `execute` callback always reads current props without being re-created.
  useEffect(() => {
    promiseRef.current = promise;
    onSuccessRef.current = options?.onSuccess;
    onErrorRef.current = options?.onError;
    initialStateRef.current = initialState;
    resetOnExecuteRef.current = resetOnExecute;
    throwErrorRef.current = throwError;
  });

  // Generation counter: each execute() captures its own generation and only
  // commits results when its capture still matches the current value. A
  // newer execute() bumps the counter, invalidating any in-flight older call.
  const execGen = useRef(0);

  const execute = useCallback(
    async (execDelay = 0): Promise<Data | undefined> => {
      const myGen = ++execGen.current;

      if (resetOnExecuteRef.current) {
        setState(initialStateRef.current);
      }
      setError(undefined);
      setIsReady(false);
      setIsLoading(true);

      if (execDelay > 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, execDelay));
      }

      try {
        const data = await promiseRef.current();
        if (myGen !== execGen.current) {
          // Stale: a newer execute() has taken over. Drop the result.
          return data;
        }
        setState(data);
        setIsReady(true);
        onSuccessRef.current?.(data);
        return data;
      } catch (e) {
        if (myGen !== execGen.current) {
          // Stale error: a newer execute() has already overwritten state.
          // Swallow it (no state writes, no callback, no rethrow) so the
          // newer call's success isn't undone.
          return;
        }
        setError(e);
        onErrorRef.current?.(e);
        if (throwErrorRef.current) {
          throw e;
        }
      } finally {
        // Only the current generation is allowed to flip isLoading off — a
        // stale call's `finally` would otherwise hide the newer call's
        // in-flight state.
        if (myGen === execGen.current) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (immediate) {
      void execute(delay);
    }
    // Mirror the qwik mount-time visible-task: run once on the client.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, isReady, isLoading, error, execute };
};
