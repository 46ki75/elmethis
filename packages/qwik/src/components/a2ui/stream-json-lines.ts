/**
 * Reads a Response body as JSON Lines, invoking `onMessage` for each parsed
 * message. Lines that fail to parse are reported via `onError` and skipped.
 *
 * Aborts cleanly when the supplied AbortSignal fires (cancels the underlying
 * reader, which lets a pending `read()` resolve as `{ done: true }`).
 */
export interface StreamJsonLinesOptions {
  signal?: AbortSignal;
  onMessage: (message: unknown) => void;
  onError?: (error: unknown, line: string) => void;
}

export async function streamJsonLines(
  body: ReadableStream<Uint8Array>,
  { signal, onMessage, onError }: StreamJsonLinesOptions,
): Promise<void> {
  if (signal?.aborted) return;

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const onAbort = () => {
    reader.cancel().catch(() => {});
  };
  signal?.addEventListener("abort", onAbort, { once: true });

  const flushLine = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    try {
      onMessage(JSON.parse(trimmed));
    } catch (err) {
      onError?.(err, trimmed);
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) flushLine(line);
    }
    if (!signal?.aborted) flushLine(buffer);
  } finally {
    signal?.removeEventListener("abort", onAbort);
    try {
      reader.releaseLock();
    } catch {
      // already released by cancel()
    }
  }
}
