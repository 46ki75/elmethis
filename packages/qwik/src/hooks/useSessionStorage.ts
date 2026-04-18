import { useStorage, UseStorageOptions } from "./useStorage";

export type UseSessionStorageOptions<T> = Omit<
  UseStorageOptions<T>,
  "storageArea"
>;

export const useSessionStorage = <T>({
  key,
  initialValue,
}: UseSessionStorageOptions<T>) => {
  return useStorage<T>({
    storageArea: sessionStorage,
    key,
    initialValue,
  });
};
