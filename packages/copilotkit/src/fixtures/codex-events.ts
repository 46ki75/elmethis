import type { Subject } from "rxjs";
import type { CodexMessage, RpcId } from "../codex-rpc.ts";

export const nativeTurn = { threadId: "native-thread", turnId: "native-turn" };
export function startNativeTurn(events: Subject<CodexMessage>): void {
  events.next({
    method: "turn/started",
    params: { threadId: nativeTurn.threadId, turn: { id: nativeTurn.turnId } },
  });
}
interface DynamicCall {
  id: RpcId;
  callId: string;
  tool: string;
  namespace?: string | null;
  arguments: unknown;
}
export function emitDynamicBatch(
  events: Subject<CodexMessage>,
  calls: DynamicCall[],
): void {
  for (const call of calls) {
    events.next({
      method: "rawResponseItem/completed",
      params: {
        ...nativeTurn,
        item: {
          type: "function_call",
          call_id: call.callId,
          name: call.tool,
          namespace: call.namespace ?? null,
          arguments: JSON.stringify(call.arguments),
        },
      },
    });
  }
  for (const { id, ...call } of calls) {
    events.next({
      method: "item/tool/call",
      id,
      params: { ...nativeTurn, ...call, namespace: call.namespace ?? null },
    });
  }
  events.next({
    method: "rawResponse/completed",
    params: { ...nativeTurn, responseId: "fixture-response" },
  });
}
