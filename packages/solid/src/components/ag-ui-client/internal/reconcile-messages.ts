import type { Message } from "@ag-ui/client";

/** Reconcile streamed SDK messages while preserving array and item identity. */
export function reconcileMessages(
  current: Message[],
  next: ReadonlyArray<Readonly<Message>>,
): void {
  for (let index = 0; index < next.length; index += 1) {
    const incoming = next[index] as Message;
    const existing = current[index];
    if (existing && existing.id === incoming.id) {
      patchMessage(existing, incoming);
    } else {
      current[index] = incoming;
    }
  }
  if (current.length > next.length) current.length = next.length;
}

function patchMessage(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): void {
  for (const key of Object.keys(source)) {
    if (key === "toolCalls") continue;
    if (target[key] !== source[key]) target[key] = source[key];
  }
  for (const key of Object.keys(target)) {
    if (key !== "toolCalls" && !(key in source)) delete target[key];
  }

  const sourceCalls = source.toolCalls;
  if (Array.isArray(sourceCalls)) {
    if (!Array.isArray(target.toolCalls)) target.toolCalls = [];
    reconcileToolCalls(
      target.toolCalls as Array<Record<string, unknown>>,
      sourceCalls as Array<Record<string, unknown>>,
    );
  } else if ("toolCalls" in target) {
    delete target.toolCalls;
  }
}

function reconcileToolCalls(
  current: Array<Record<string, unknown>>,
  next: Array<Record<string, unknown>>,
): void {
  for (let index = 0; index < next.length; index += 1) {
    const incoming = next[index];
    const existing = current[index];
    if (existing && existing.id === incoming.id) {
      if (existing.type !== incoming.type) existing.type = incoming.type;
      if (existing.function == null) existing.function = {};
      const targetFunction = existing.function as Record<string, unknown>;
      const incomingFunction = (incoming.function ?? {}) as Record<
        string,
        unknown
      >;
      if (targetFunction.name !== incomingFunction.name) {
        targetFunction.name = incomingFunction.name;
      }
      if (targetFunction.arguments !== incomingFunction.arguments) {
        targetFunction.arguments = incomingFunction.arguments;
      }
    } else {
      current[index] = incoming;
    }
  }
  if (current.length > next.length) current.length = next.length;
}
