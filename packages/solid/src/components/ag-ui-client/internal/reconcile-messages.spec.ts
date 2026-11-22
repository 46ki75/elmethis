import {
  createEffect,
  createRoot,
  createStore,
  flush,
  untrack,
} from "solid-js";
import type { Message } from "@ag-ui/client";
import { describe, expect, it, vi } from "vitest";

import { reconcileMessages } from "./reconcile-messages";

const assistant = (id: string, content: string): Message => ({
  id,
  role: "assistant",
  content,
});

describe("reconcileMessages", () => {
  it("preserves identities and notifies Solid for streamed content", () => {
    const [messages, setMessages] = createStore([assistant("a", "He")]);
    const message = untrack(() => messages[0]);
    const observe = vi.fn<(content: Message["content"] | undefined) => void>();
    const dispose = createRoot((dispose) => {
      createEffect(
        () => messages[0]?.content,
        (content) => observe(content),
      );
      return dispose;
    });
    flush();

    setMessages((draft) => reconcileMessages(draft, [assistant("a", "Hello")]));
    flush();

    untrack(() => {
      expect(messages[0]).toBe(message);
      expect(messages[0].content).toBe("Hello");
    });
    expect(observe).toHaveBeenLastCalledWith("Hello");
    dispose();
  });

  it("replaces divergent ids and truncates removed messages", () => {
    const messages = [assistant("a", "old"), assistant("b", "tail")];
    reconcileMessages(messages, [assistant("z", "new")]);
    expect(messages).toEqual([assistant("z", "new")]);
  });
});
