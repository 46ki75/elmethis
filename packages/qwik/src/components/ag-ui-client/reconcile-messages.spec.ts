import { describe, expect, test } from "vitest";
import type { Message } from "@ag-ui/client";

import { reconcileMessages } from "./reconcile-messages";

const msg = (over: Record<string, unknown>): Message =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({ role: "assistant", content: "", ...over }) as any;

describe("reconcileMessages", () => {
  test("mutates the array in place (preserves the array reference)", () => {
    const current: Message[] = [];
    reconcileMessages(current, [msg({ id: "a", content: "hi" })]);
    expect(current.map((m) => m.id)).toEqual(["a"]);
  });

  test("preserves object identity for a matching id and mutates content", () => {
    const current: Message[] = [];
    reconcileMessages(current, [msg({ id: "a", content: "He" })]);
    const first = current[0];

    reconcileMessages(current, [msg({ id: "a", content: "Hello" })]);

    // Same object, content streamed in place — this is what keeps the
    // renderer's fine-grained reactivity alive.
    expect(current[0]).toBe(first);
    expect(current[0].content).toBe("Hello");
  });

  test("appends newly-arrived messages, keeping earlier identities", () => {
    const current: Message[] = [];
    reconcileMessages(current, [msg({ id: "u", role: "user", content: "q" })]);
    const userObj = current[0];

    reconcileMessages(current, [
      msg({ id: "u", role: "user", content: "q" }),
      msg({ id: "a", content: "answer" }),
    ]);

    expect(current[0]).toBe(userObj);
    expect(current.map((m) => m.id)).toEqual(["u", "a"]);
  });

  test("truncates removed tail messages", () => {
    const current: Message[] = [];
    reconcileMessages(current, [msg({ id: "a" }), msg({ id: "b" })]);
    reconcileMessages(current, [msg({ id: "a" })]);
    expect(current.map((m) => m.id)).toEqual(["a"]);
  });

  test("replaces a slot whose id diverged (e.g. MESSAGES_SNAPSHOT rewrite)", () => {
    const current: Message[] = [];
    reconcileMessages(current, [msg({ id: "a", content: "old" })]);
    const oldObj = current[0];

    reconcileMessages(current, [msg({ id: "z", content: "new" })]);

    expect(current[0]).not.toBe(oldObj);
    expect(current[0].id).toBe("z");
    expect(current[0].content).toBe("new");
  });

  test("deletes fields that disappeared from the source message", () => {
    const current: Message[] = [];
    reconcileMessages(current, [msg({ id: "a", content: "x", name: "tmp" })]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((current[0] as any).name).toBe("tmp");

    reconcileMessages(current, [msg({ id: "a", content: "x" })]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect("name" in (current[0] as any)).toBe(false);
  });

  test("reconciles tool-call args in place, preserving tool-call identity", () => {
    const current: Message[] = [];
    reconcileMessages(current, [
      msg({
        id: "a",
        content: null,
        toolCalls: [{ id: "tc1", function: { name: "f", arguments: '{"a' } }],
      }),
    ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolCall = (current[0] as any).toolCalls[0];

    reconcileMessages(current, [
      msg({
        id: "a",
        content: null,
        toolCalls: [
          { id: "tc1", function: { name: "f", arguments: '{"a":1}' } },
        ],
      }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((current[0] as any).toolCalls[0]).toBe(toolCall);
    expect(toolCall.function.arguments).toBe('{"a":1}');
  });
});
