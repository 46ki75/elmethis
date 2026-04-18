import { useStorage, UseStorageOptions } from "./useStorage";

export type UseLocalStorageOptions<T> = {
  key: UseStorageOptions<T>["key"];
  initialValue: UseStorageOptions<T>["initialValue"];
};

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
