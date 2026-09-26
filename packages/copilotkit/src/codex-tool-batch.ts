import { z } from "zod";
import type { RpcId } from "./codex-rpc.ts";

export interface StateToolResult {
  success: boolean;
  contentItems: { type: "inputText"; text: string }[];
}
interface Call {
  id: string;
  tool: string;
  namespace: string | null;
  arguments: unknown;
  frontendName?: string;
}
interface Options {
  frontendNamespace: string;
  frontendNames: ReadonlyMap<string, string>;
  stateToolName: string;
  validateState(args: unknown): boolean;
  updateState(args: unknown): StateToolResult;
  frontend(callId: string, name: string, args: unknown): void;
  cancelBackend(
    callId: string,
    namespace: string,
    name: string,
    args: unknown,
  ): void;
  respond(id: RpcId, result: StateToolResult): void;
  finish(): void;
}
const requestSchema = z.object({
  threadId: z.string(),
  turnId: z.string(),
  callId: z.string(),
  tool: z.string(),
  namespace: z.string().nullish(),
  arguments: z.unknown(),
});

// Dynamic callbacks execute serially, even when inference generates parallel
// calls. The raw response boundary precedes draining those tool futures:
// https://github.com/openai/codex/blob/rust-v0.157.1/codex-rs/core/src/session/turn.rs#L2872
// Waiting for all callbacks would deadlock; closing on the first loses the rest.
export class CodexToolBatch {
  private options: Options;
  private turn?: { threadId: string; turnId: string };
  private batch = new Map<string, Call>();
  private seen = new Set<string>();
  private pendingState = new Map<string, RpcId>();
  private stateResults = new Map<string, StateToolResult>();

  constructor(options: Options) {
    this.options = options;
  }

  start(params: Record<string, unknown>): void {
    const start = z
      .object({ threadId: z.string(), turn: z.object({ id: z.string() }) })
      .parse(params);
    this.turn = { threadId: start.threadId, turnId: start.turn.id };
    this.batch.clear();
    this.seen.clear();
    this.pendingState.clear();
    this.stateResults.clear();
  }

  private current(params: Record<string, unknown>): boolean {
    return (
      this.turn !== undefined &&
      params.threadId === this.turn.threadId &&
      params.turnId === this.turn.turnId
    );
  }

  capture(params: Record<string, unknown>): void {
    if (!this.current(params)) {
      return;
    }
    const parsed = z
      .object({
        type: z.literal("function_call"),
        call_id: z.string(),
        name: z.string(),
        namespace: z.string().nullish(),
        arguments: z.string(),
      })
      .safeParse(params.item);
    if (!parsed.success) {
      return;
    }
    const raw = parsed.data;
    if (this.seen.has(raw.call_id)) {
      throw new Error("Codex emitted a duplicate tool call ID.");
    }
    this.seen.add(raw.call_id);
    const namespace = raw.namespace ?? null;
    let frontendName: string | undefined;
    if (namespace === this.options.frontendNamespace) {
      frontendName = this.options.frontendNames.get(raw.name);
      if (frontendName === undefined) {
        throw new Error(
          `Codex requested an unregistered frontend tool: ${raw.name}`,
        );
      }
    } else if (
      !namespace?.startsWith("mcp__") &&
      (namespace !== null || raw.name !== this.options.stateToolName)
    ) {
      return;
    }
    let args: unknown;
    try {
      args = z.json().parse(JSON.parse(raw.arguments));
    } catch {
      throw new Error("Codex emitted invalid JSON tool arguments.");
    }
    this.batch.set(raw.call_id, {
      id: raw.call_id,
      tool: raw.name,
      namespace,
      arguments: args,
      frontendName,
    });
  }

  request(id: RpcId, params: Record<string, unknown>): void {
    const call = requestSchema.parse(params);
    if (!this.current(call)) {
      throw new Error("Codex tool request does not belong to the active turn.");
    }
    const isState =
      call.namespace == null && call.tool === this.options.stateToolName;
    if (isState && this.stateResults.has(call.callId)) {
      const result = this.stateResults.get(call.callId)!;
      this.stateResults.delete(call.callId);
      this.options.respond(id, result);
      return;
    }
    const raw = this.batch.get(call.callId);
    if (
      !raw ||
      (raw.frontendName === undefined && raw.namespace !== null) ||
      raw.tool !== call.tool ||
      raw.namespace !== (call.namespace ?? null)
    ) {
      throw new Error(
        "Codex tool request has no matching raw call in the active batch.",
      );
    }
    if (isState) {
      if (this.pendingState.has(call.callId)) {
        throw new Error("Codex duplicated a state tool request.");
      }
      this.pendingState.set(call.callId, id);
    }
    // Frontend calls remain unanswered. Their whole model-generated batch is
    // handed off at the response boundary, then the ephemeral CLI is closed.
  }

  complete(params: Record<string, unknown>): void {
    if (!this.current(params)) {
      return;
    }
    const calls = [...this.batch.values()];
    this.batch.clear();
    const handoff = calls.some((call) => call.frontendName !== undefined);
    if (handoff) {
      const stateCalls = calls.filter(
        (call) => call.frontendName === undefined && call.namespace === null,
      );
      // Validate the entire mixed batch before emitting TOOL_CALL_END, which can
      // execute side effects immediately in the browser.
      if (
        stateCalls.some((call) => !this.options.validateState(call.arguments))
      ) {
        throw new Error("Invalid shared-state update in frontend tool batch.");
      }
      for (const call of stateCalls) {
        if (!this.options.updateState(call.arguments).success) {
          throw new Error(
            "Invalid shared-state update in frontend tool batch.",
          );
        }
      }
      for (const call of calls) {
        if (call.frontendName !== undefined) {
          this.options.frontend(call.id, call.frontendName, call.arguments);
        } else if (call.namespace !== null) {
          this.options.cancelBackend(
            call.id,
            call.namespace,
            call.tool,
            call.arguments,
          );
        }
      }
      this.options.finish();
      return;
    }
    for (const call of calls) {
      if (call.namespace === null) {
        this.stateResults.set(
          call.id,
          this.options.updateState(call.arguments),
        );
      }
    }
    // Some state callbacks arrive before the boundary, others afterward. Each
    // state update is applied once, in model output order, independent of that race.
    for (const [callId, id] of this.pendingState) {
      const result = this.stateResults.get(callId);
      if (result) {
        this.pendingState.delete(callId);
        this.stateResults.delete(callId);
        this.options.respond(id, result);
      }
    }
  }
}
