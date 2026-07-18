import { describe, expect, it, vi } from "vitest";

import { streamJsonLines } from "./stream-json-lines";

const streamOf = (...chunks: string[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks)
        controller.enqueue(new TextEncoder().encode(chunk));
      controller.close();
    },
  });

describe("streamJsonLines", () => {
  it("parses split chunks, blank lines, and an unterminated tail", async () => {
    const messages: unknown[] = [];
    await streamJsonLines(streamOf('{"a":', "1}\n\n", '{"b":2}'), {
      onMessage: (message) => messages.push(message),
    });
    expect(messages).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it("reports an invalid line and continues", async () => {
    const messages: unknown[] = [];
    const onError = vi.fn();
    await streamJsonLines(streamOf('bad\n{"ok":true}\n'), {
      onMessage: (message) => messages.push(message),
      onError,
    });
    expect(onError).toHaveBeenCalledOnce();
    expect(messages).toEqual([{ ok: true }]);
  });

  it("cancels a pending reader when aborted", async () => {
    const controller = new AbortController();
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({
      pull() {
        controller.abort();
      },
      cancel() {
        cancelled = true;
      },
    });
    await streamJsonLines(stream, {
      signal: controller.signal,
      onMessage: vi.fn(),
    });
    expect(cancelled).toBe(true);
  });
});
