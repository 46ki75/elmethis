import { describe, expect, it, vi } from "vitest";

import { textContent, textEnd, textStart } from "./events";
import { StubAgent } from "./stub-agent";
import { makeInput } from "./test-support";
import type { Scenario } from "./types";

describe("StubAgent", () => {
  it("applies a built-in scenario through AbstractAgent", async () => {
    const agent = new StubAgent({
      scenario: "text-stream",
      threadId: "stub-thread",
    });

    await agent.runAgent({ runId: "stub-run" });

    expect(agent.messages).toContainEqual({
      id: "stub-text-1",
      role: "assistant",
      content: "Hello, this is a stubbed AG-UI text stream.",
    });
  });

  it("accepts custom scenarios", async () => {
    const custom: Scenario = async function* () {
      yield textStart("custom-message");
      yield textContent("custom-message", "Custom response");
      yield textEnd("custom-message");
    };
    const agent = new StubAgent({ scenario: custom });

    await agent.runAgent({ runId: "custom-run" });

    expect(agent.messages.at(-1)).toMatchObject({
      id: "custom-message",
      content: "Custom response",
    });
  });

  it("cancels scenario iteration when unsubscribed", async () => {
    let started = false;
    let finalized = false;
    const streaming: Scenario = async function* ({ delay }) {
      try {
        started = true;
        yield textStart("streaming-message");
        await delay();
        yield textContent("streaming-message", "late chunk");
      } finally {
        finalized = true;
      }
    };
    const agent = new StubAgent({ scenario: streaming, chunkDelayMs: 10_000 });
    const subscription = agent.run(makeInput()).subscribe();

    await vi.waitFor(() => expect(started).toBe(true));
    subscription.unsubscribe();

    await vi.waitFor(() => expect(finalized).toBe(true));
  });
});
