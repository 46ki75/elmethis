import { useCallback, useEffect, useRef, useState } from "react";

const CUSTOM_EVENT = "elm-local-storage-change";

export function useLocalStorageDispatch<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
): [S, (action: A) => void, () => void];
export function useLocalStorageDispatch<S, A>(
  key: string,
  reducer: (state: S, action: A) => S,
  initialState: S,
): [S, (action: A) => void, () => void];
export function useLocalStorageDispatch<S, A>(
  keyOrReducer: string | ((state: S, action: A) => S),
  reducerOrInitial: ((state: S, action: A) => S) | S,
  maybeInitial?: S,
): [S, (action: A) => void, () => void] {
  const hasKey = typeof keyOrReducer === "string";
  const key = hasKey ? (keyOrReducer as string) : null;
  const reducer = hasKey
    ? (reducerOrInitial as (state: S, action: A) => S)
    : (keyOrReducer as (state: S, action: A) => S);
  const initialState = hasKey ? (maybeInitial as S) : (reducerOrInitial as S);

  const reducerRef = useRef(reducer);
  useEffect(() => {
    reducerRef.current = reducer;
  });

  const initialStateRef = useRef(initialState);

  const [state, setState] = useState<S>(() => {
    if (!key || typeof localStorage === "undefined") return initialState;
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return initialState;
      return JSON.parse(stored) as S;
    } catch {
      return initialState;
    }
  });

  const dispatchChange = useCallback(
    (newValue: S) => {
      if (!key || typeof window === "undefined") return;
      window.dispatchEvent(
        new CustomEvent(CUSTOM_EVENT, { detail: { key, newValue } }),
      );
    },
    [key],
  );

  const dispatch = useCallback(
    (action: A) => {
      setState((prev) => {
        const next = reducerRef.current(prev, action);
        if (key && typeof localStorage !== "undefined") {
          try {
            localStorage.setItem(key, JSON.stringify(next));
          } catch (e) {
            console.warn(`useLocalStorageDispatch: failed to write "${key}"`, e);
          }
        }
        dispatchChange(next);
        return next;
      });
    },
    [key, dispatchChange],
  );

  const remove = useCallback(() => {
    if (key && typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
    setState(initialStateRef.current);
    dispatchChange(initialStateRef.current);
  }, [key, dispatchChange]);

  useEffect(() => {
    if (!key || typeof window === "undefined") return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      if (e.newValue === null) {
        setState(initialStateRef.current);
        return;
      }
      try {
        setState(JSON.parse(e.newValue) as S);
      } catch {
        console.warn(`useLocalStorageDispatch: failed to parse storage event for "${key}"`);
      }
    };

    const handleCustom = (e: Event) => {
      const { key: k, newValue } = (
        e as CustomEvent<{ key: string; newValue: S }>
      ).detail;
      if (k !== key) return;
      setState(newValue);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(CUSTOM_EVENT, handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(CUSTOM_EVENT, handleCustom);
    };
  }, [key]);

  return [state, dispatch, remove];
}
