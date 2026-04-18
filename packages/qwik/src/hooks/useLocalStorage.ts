import { useStorage, UseStorageOptions } from "./useStorage";

export type UseLocalStorageOptions<T> = Omit<
  UseStorageOptions<T>,
  "storageArea"
>;

export const useLocalStorage = <T>({
  key,
  initialValue,
}: UseLocalStorageOptions<T>) => {
  return useStorage<T>({
    storageArea: localStorage,
    key,
    initialValue,
  });
};
