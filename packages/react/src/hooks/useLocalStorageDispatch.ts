import { useCallback, useRef } from "react";
import type { UseLocalStorageOptions } from "./useLocalStorage";

const CUSTOM_EVENT = "elm-local-storage-change";

type Setter<T> = (value: T | ((prev: T) => T)) => void;
type Remover = () => void;

export function useLocalStorageDispatch(
  key: string,
  options: { raw: true },
): [Setter<string>, Remover];
export function useLocalStorageDispatch<T>(
  key: string,
  options?: UseLocalStorageOptions<T>,
): [Setter<T>, Remover];
export function useLocalStorageDispatch<T>(
  key: string,
  options?: UseLocalStorageOptions<T> | { raw: true },
): [Setter<T>, Remover] {
  const raw = !!(options && "raw" in options && options.raw);

  const serializerRef = useRef<(v: T) => string>(
    raw
      ? (v: T) => String(v)
      : ((!raw && options && "serializer" in options && options.serializer) ||
          ((v: T) => JSON.stringify(v))),
  );
  const deserializerRef = useRef<(s: string) => T>(
    raw
      ? (s: string) => s as unknown as T
      : ((!raw && options && "deserializer" in options && options.deserializer) ||
          ((s: string) => JSON.parse(s) as T)),
  );

  const readFromStorage = useCallback((): T | undefined => {
    if (typeof localStorage === "undefined") return undefined;
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return undefined;
      return deserializerRef.current(stored);
    } catch (e) {
      console.warn(`useLocalStorageDispatch: failed to read "${key}"`, e);
      return undefined;
    }
  }, [key]);

  const dispatchChange = useCallback(
    (newValue: T | null) => {
      if (typeof window === "undefined") return;
      window.dispatchEvent(
        new CustomEvent(CUSTOM_EVENT, { detail: { key, newValue } }),
      );
    },
    [key],
  );

  const set: Setter<T> = useCallback(
    (valueOrUpdater) => {
      const current = readFromStorage();
      const next =
        typeof valueOrUpdater === "function"
          ? (valueOrUpdater as (p: T | undefined) => T)(current)
          : valueOrUpdater;
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.setItem(key, serializerRef.current(next));
        } catch (e) {
          console.warn(`useLocalStorageDispatch: failed to write "${key}"`, e);
        }
      }
      dispatchChange(next);
    },
    [key, readFromStorage, dispatchChange],
  );

  const remove: Remover = useCallback(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
    dispatchChange(null);
  }, [key, dispatchChange]);

  return [set, remove];
}
