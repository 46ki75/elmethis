/**
 * Build a `delay()` thunk for a scenario. A non-positive delay resolves
 * immediately (no timer scheduled) so deterministic tests run at full speed;
 * a positive delay paces each chunk for Storybook / manual streaming demos.
 */
export function makeDelay(ms: number): () => Promise<void> {
  if (!Number.isFinite(ms) || ms <= 0) return () => Promise.resolve();
  return () => new Promise<void>((resolve) => setTimeout(resolve, ms));
}
