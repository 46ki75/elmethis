import type { Message } from "@ag-ui/client";

/**
 * Reconcile the live message store toward the SDK's freshly-rebuilt list,
 * **mutating `current` in place** rather than reassigning it.
 *
 * Why in place: the SDK hands `onMessagesChanged` a brand-new array of
 * brand-new message objects on every streaming delta. Dropping that array
 * straight into a Qwik store (`state.messages = next`) swaps the object
 * identity of the streaming message on each token, which defeats fine-grained
 * reactivity — `ElmMarkdown` caches its parsed tokens against a stable
 * `message.content` signal, so a reused renderer instance fed a replaced parent
 * object never repaints (the bubble shows empty even though the data is
 * correct). Keeping array + per-message identity stable and mutating only the
 * changed fields restores the fine-grained content updates the renderer relies
 * on.
 *
 * Alignment is by index with an id check; AG-UI message history is
 * append-mostly, so on a `MESSAGES_SNAPSHOT`-style rewrite the ids stop
 * matching and those slots are replaced wholesale — still correct, just not
 * identity-preserving for that one emit.
 */
export function reconcileMessages(
  current: Message[],
  next: ReadonlyArray<Readonly<Message>>,
): void {
  for (let i = 0; i < next.length; i++) {
    const incoming = next[i] as Message;
    const existing = current[i];
    if (existing && existing.id === incoming.id) {
      patchMessage(existing, incoming);
    } else {
      // First appearance (or a divergent id at this slot): drop in the fresh
      // object. Subsequent deltas for the same id patch it in place.
      current[i] = incoming;
    }
  }
  if (current.length > next.length) {
    current.length = next.length;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function patchMessage(target: any, source: any): void {
  // Sync scalar fields in place so consumers see a property change on a stable
  // object (string `content` is the streaming-critical one).
  for (const key of Object.keys(source)) {
    if (key === "toolCalls") continue;
    if (target[key] !== source[key]) target[key] = source[key];
  }
  for (const key of Object.keys(target)) {
    if (key !== "toolCalls" && !(key in source)) delete target[key];
  }

  // Tool-call args also stream — reconcile by id so each call's growing
  // `arguments` string stays a stable signal too.
  if (source.toolCalls) {
    if (!target.toolCalls) target.toolCalls = [];
    reconcileToolCalls(target.toolCalls, source.toolCalls);
  } else if ("toolCalls" in target) {
    delete target.toolCalls;
  }
}

function reconcileToolCalls(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  current: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  next: any[],
): void {
  for (let i = 0; i < next.length; i++) {
    const incoming = next[i];
    const existing = current[i];
    if (existing && existing.id === incoming.id) {
      if (existing.type !== incoming.type) existing.type = incoming.type;
      if (!existing.function) existing.function = {};
      const fn = existing.function;
      const incomingFn = incoming.function ?? {};
      if (fn.name !== incomingFn.name) fn.name = incomingFn.name;
      if (fn.arguments !== incomingFn.arguments)
        fn.arguments = incomingFn.arguments;
    } else {
      current[i] = incoming;
    }
  }
  if (current.length > next.length) {
    current.length = next.length;
  }
}
