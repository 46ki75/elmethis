import { describe, expect, test, vi } from "vitest";

import { streamJsonLines } from "./stream-json-lines";

function streamOf(...chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c));
      controller.close();
    },
  });
}

describe("streamJsonLines", () => {
  test("parses one JSON per line", async () => {
    const received: unknown[] = [];
    await streamJsonLines(streamOf('{"a":1}\n{"b":2}\n'), {
      onMessage: (m) => received.push(m),
    });
    expect(received).toEqual([{ a: 1 }, { b: 2 }]);
  });

  test("handles a trailing line without a newline", async () => {
    const received: unknown[] = [];
    await streamJsonLines(streamOf('{"a":1}\n{"b":2}'), {
      onMessage: (m) => received.push(m),
    });
    expect(received).toEqual([{ a: 1 }, { b: 2 }]);
  });

  test("joins chunks split mid-line", async () => {
    const received: unknown[] = [];
    await streamJsonLines(streamOf('{"hello":', '"world"}\n'), {
      onMessage: (m) => received.push(m),
    });
    expect(received).toEqual([{ hello: "world" }]);
  });

  test("ignores blank lines", async () => {
    const received: unknown[] = [];
    await streamJsonLines(streamOf("\n\n{}\n\n"), {
      onMessage: (m) => received.push(m),
    });
    expect(received).toEqual([{}]);
  });

  test("reports parse errors but keeps streaming", async () => {
    const received: unknown[] = [];
    const onError = vi.fn();
    await streamJsonLines(streamOf("not json\n{\"ok\":true}\n"), {
      onMessage: (m) => received.push(m),
      onError,
    });
    expect(received).toEqual([{ ok: true }]);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][1]).toBe("not json");
  });

  test("returns immediately if the signal is already aborted", async () => {
    const received: unknown[] = [];
    const ctrl = new AbortController();
    ctrl.abort();
    await streamJsonLines(streamOf('{"a":1}\n'), {
      signal: ctrl.signal,
      onMessage: (m) => received.push(m),
    });
    expect(received).toEqual([]);
  });

  test("stops reading once the signal aborts mid-stream", async () => {
    const received: unknown[] = [];
    const ctrl = new AbortController();
    const encoder = new TextEncoder();
    let pulls = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulls++;
        controller.enqueue(encoder.encode(`{"n":${pulls}}\n`));
        if (pulls === 1) {
          // Abort right after the first chunk is delivered.
          queueMicrotask(() => ctrl.abort());
        }
      },
    });
    await streamJsonLines(stream, {
      signal: ctrl.signal,
      onMessage: (m) => received.push(m),
    });
    expect(received[0]).toEqual({ n: 1 });
    // The loop must terminate — assertion above plus the await completing
    // proves that. We don't assert exact length because timing of cancel()
    // versus the next pull is implementation-dependent.
  });
});
