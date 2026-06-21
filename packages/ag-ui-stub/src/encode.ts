import type { BaseEvent } from "@ag-ui/core";
import { EventEncoder } from "@ag-ui/encoder";

/** The content type AG-UI `HttpAgent` requests and this stub always serves. */
export const SSE_CONTENT_TYPE = "text/event-stream";

/**
 * Encode an async stream of AG-UI events as a Server-Sent Events
 * `ReadableStream`. The stream is *pull-based*: exactly one event is encoded
 * per consumer `pull`, so a slow client applies real backpressure to the
 * scenario generator (exercised by the `long-stream` scenario).
 */
export function eventsToSseStream(
  events: AsyncIterable<BaseEvent>,
): ReadableStream<Uint8Array> {
  const encoder = new EventEncoder();
  const textEncoder = new TextEncoder();
  const iterator = events[Symbol.asyncIterator]();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) {
          controller.close();
          return;
        }
        controller.enqueue(textEncoder.encode(encoder.encodeSSE(value)));
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel() {
      await iterator.return?.();
    },
  });
}
