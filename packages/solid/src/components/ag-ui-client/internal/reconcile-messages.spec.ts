/* eslint-disable solid/reactivity -- This test intentionally inspects a mutable store. */
import { createEffect, createRoot } from "solid-js";
import { createMutable } from "solid-js/store";
import type { Message } from "@ag-ui/client";
import { describe, expect, it, vi } from "vitest";

import { reconcileMessages } from "./reconcile-messages";

const assistant = (id: string, content: string): Message =>
  ({ id, role: "assistant", content }) as Message;

describe("reconcileMessages", () => {
  it("preserves identities and notifies Solid for streamed content", async () => {
    let dispose: () => void = () => undefined;
    let messages!: Message[];
    let array!: Message[];
    let message!: Message;
    const observe = vi.fn((content: Message["content"] | undefined) => content);
    createRoot((rootDispose) => {
      dispose = rootDispose;
      messages = createMutable<Message[]>([]);
      reconcileMessages(messages, [assistant("a", "He")]);
      array = messages;
      message = messages[0];
      createEffect(() => observe(messages[0]?.content));
    });
    await Promise.resolve();

    reconcileMessages(messages, [assistant("a", "Hello")]);
    await Promise.resolve();

    expect(messages).toBe(array);
    expect(messages[0]).toBe(message);
    expect(messages[0].content).toBe("Hello");
    expect(observe).toHaveBeenLastCalledWith("Hello");
    dispose();
  });

  it("replaces divergent ids and truncates removed messages", () => {
    const messages = [assistant("a", "old"), assistant("b", "tail")];
    reconcileMessages(messages, [assistant("z", "new")]);
    expect(messages).toEqual([assistant("z", "new")]);
  });
});
