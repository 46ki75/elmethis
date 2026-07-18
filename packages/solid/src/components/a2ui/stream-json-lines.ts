export interface StreamJsonLinesOptions {
  signal?: AbortSignal;
  onMessage: (message: unknown) => void;
  onError?: (error: unknown, line: string) => void;
}

/** Incrementally parses a JSONL byte stream, skipping malformed lines. */
export async function streamJsonLines(
  body: ReadableStream<Uint8Array>,
  { signal, onMessage, onError }: StreamJsonLinesOptions,
): Promise<void> {
  if (signal?.aborted) return;

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const abort = () => void reader.cancel().catch(() => undefined);
  signal?.addEventListener("abort", abort, { once: true });

  const parse = (line: string) => {
    const value = line.trim();
    if (!value) return;
    try {
      onMessage(JSON.parse(value));
    } catch (error) {
      onError?.(error, value);
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) parse(line);
    }
    if (!signal?.aborted) parse(buffer);
  } finally {
    signal?.removeEventListener("abort", abort);
    try {
      reader.releaseLock();
    } catch {
      // Cancellation can release the lock first.
    }
  }
}
