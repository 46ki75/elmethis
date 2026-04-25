import { $, type QRL, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";

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

  const execute: QRL<(delay?: number) => Promise<Data | undefined>> = $(
    async (execDelay = 0) => {
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
        state.value = data;
        isReady.value = true;
        if (onSuccess$) {
          await onSuccess$(data);
        }
        return data;
      } catch (e) {
        error.value = e;
        if (onError$) {
          await onError$(e);
        }
        if (config.throwError) {
          throw e;
        }
      } finally {
        isLoading.value = false;
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
