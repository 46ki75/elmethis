/**
 * Build a `delay()` thunk for a scenario. A non-positive delay resolves
 * immediately (no timer scheduled) so deterministic tests run at full speed;
 * a positive delay paces each chunk for Storybook / manual streaming demos.
 */
export function makeDelay(
  ms: number,
  signal?: AbortSignal,
): () => Promise<void> {
  if (!Number.isFinite(ms) || ms <= 0) return () => Promise.resolve();
  return () =>
    new Promise<void>((resolve) => {
      if (signal?.aborted) {
        resolve();
        return;
      }

      const finish = () => {
        clearTimeout(timeout);
        signal?.removeEventListener("abort", finish);
        resolve();
      };
      const timeout = setTimeout(finish, ms);
      signal?.addEventListener("abort", finish, { once: true });
    });
}
