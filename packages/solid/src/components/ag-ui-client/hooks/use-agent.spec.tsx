import { render } from "@solidjs/testing-library";
import type { AbstractAgent, AgentSubscriber, Message } from "@ag-ui/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAgent, type UseAgentReturn } from "./use-agent";

class FakeAgent {
  messages: Message[] = [];
  runStarted = 0;
  aborted = 0;
  private subscriber: AgentSubscriber | undefined;
  private finishCurrent: (() => void) | undefined;

  subscribe(subscriber: AgentSubscriber) {
    this.subscriber = subscriber;
    return { unsubscribe: () => (this.subscriber = undefined) };
  }

  get connected() {
    return this.subscriber !== undefined;
  }

  async runAgent() {
    await this.subscriber?.onRunInitialized?.({} as never);
    this.runStarted += 1;
    return await new Promise<Record<string, never>>((resolve) => {
      this.finishCurrent = () => {
        this.finishCurrent = undefined;
        void (async () => {
          await this.subscriber?.onRunFinishedEvent?.({
            outcome: "success",
            event: {},
          } as never);
          await this.subscriber?.onRunFinalized?.({} as never);
          resolve({});
        })();
      };
    });
  }

  finish() {
    this.finishCurrent?.();
  }

  abortRun() {
    this.aborted += 1;
  }
}

describe("useAgent", () => {
  let fake: FakeAgent;
  let agent!: UseAgentReturn;

  beforeEach(async () => {
    fake = new FakeAgent();
    const Harness = () => {
      agent = useAgent({
        url: "https://agent.test/run",
        agentFactory: () => fake as unknown as AbstractAgent,
      });
      return null;
    };
    render(() => <Harness />);
    await vi.waitFor(() => expect(fake.connected).toBe(true));
  });

  it("queues during a run, unwinds newest-first, and drains FIFO", async () => {
    void agent.send([{ type: "text", text: "first" }]);
    await vi.waitFor(() => expect(fake.runStarted).toBe(1));

    await agent.send([{ type: "text", text: "second" }]);
    await agent.send([{ type: "text", text: "third" }]);
    expect(agent.state.queue.map((queued) => queued.content[0])).toEqual([
      { type: "text", text: "second" },
      { type: "text", text: "third" },
    ]);

    agent.abort();
    expect(agent.state.queue).toHaveLength(1);
    expect(fake.aborted).toBe(0);

    fake.finish();
    await vi.waitFor(() => expect(fake.runStarted).toBe(2));
    expect(agent.state.queue).toHaveLength(0);

    fake.finish();
    await vi.waitFor(() => expect(agent.state.isRunning).toBe(false));
    expect(
      agent.state.messages.filter((message) => message.role === "user"),
    ).toHaveLength(2);
  });

  it("dequeues a specific message without aborting the active run", async () => {
    void agent.send([{ type: "text", text: "first" }]);
    await vi.waitFor(() => expect(agent.state.isRunning).toBe(true));
    await agent.send([{ type: "text", text: "second" }]);
    await agent.send([{ type: "text", text: "third" }]);

    agent.dequeue(agent.state.queue[0].id);

    expect(agent.state.queue).toHaveLength(1);
    expect(fake.aborted).toBe(0);
  });

  it("aborts the transport when no queued messages remain", async () => {
    void agent.send([{ type: "text", text: "only" }]);
    await vi.waitFor(() => expect(agent.state.isRunning).toBe(true));

    agent.abort();

    expect(fake.aborted).toBe(1);
    expect(agent.state.status).toBe("aborted");
    expect(agent.state.isRunning).toBe(false);
  });
});
