import { createSignal, onCleanup, onMount, type Accessor } from "solid-js";

export interface CreateAsyncStateOptions<Data = unknown> {
  /** Delay for the automatic client-side execution. @default 0 */
  delay?: number;
  /** Execute after the owner mounts on the client. @default true */
  immediate?: boolean;
  /** Called when the current execution rejects. */
  onError?: (error: unknown) => void;
  /** Called when the current execution resolves. */
  onSuccess?: (data: Data) => void;
  /** Reset state before each execution. @default true */
  resetOnExecute?: boolean;
  /** Re-throw the current execution's error. @default false */
  throwError?: boolean;
}

export interface CreateAsyncStateReturn<Data> {
  state: Accessor<Data>;
  isReady: Accessor<boolean>;
  isLoading: Accessor<boolean>;
  error: Accessor<unknown>;
  execute: (delay?: number) => Promise<Data | undefined>;
}

/** Creates owner-scoped async state with latest-execution-wins commits. */
export function createAsyncState<Data>(
  task: () => Promise<Data>,
  initialState: Data,
  options: CreateAsyncStateOptions<Data> = {},
): CreateAsyncStateReturn<Data> {
  const [state, setState] = createSignal(initialState, { equals: Object.is });
  const [isReady, setIsReady] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<unknown>(undefined, {
    equals: Object.is,
  });
  const pendingDelays = new Map<ReturnType<typeof setTimeout>, () => void>();
  let generation = 0;
  let disposed = false;

  const wait = (delay: number) =>
    new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        pendingDelays.delete(timer);
        resolve();
      }, delay);
      pendingDelays.set(timer, resolve);
    });

  const execute = async (delay = 0): Promise<Data | undefined> => {
    if (disposed) return;

    const execution = ++generation;
    if (options.resetOnExecute ?? true) setState(() => initialState);
    setError(undefined);
    setIsReady(false);
    setIsLoading(true);

    if (delay > 0) await wait(delay);
    if (disposed || execution !== generation) return;

    try {
      const data = await task();
      if (disposed || execution !== generation) return data;

      setState(() => data);
      setIsReady(true);
      options.onSuccess?.(data);
      return data;
    } catch (caughtError) {
      if (disposed || execution !== generation) return;

      setError(caughtError);
      options.onError?.(caughtError);
      if (options.throwError ?? false) throw caughtError;
    } finally {
      if (!disposed && execution === generation) setIsLoading(false);
    }
  };

  onMount(() => {
    if (options.immediate ?? true) {
      void execute(options.delay ?? 0).catch(() => undefined);
    }
  });

  onCleanup(() => {
    disposed = true;
    generation++;
    for (const [timer, resolve] of pendingDelays) {
      clearTimeout(timer);
      resolve();
    }
    pendingDelays.clear();
  });

  return { state, isReady, isLoading, error, execute };
}
