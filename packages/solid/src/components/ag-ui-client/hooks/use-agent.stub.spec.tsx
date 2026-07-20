import { render } from "@solidjs/testing-library";
import { StubAgent, type ScenarioName } from "@elmethis/ag-ui-stub";
import { describe, expect, it, vi } from "vitest";

import { useAgent, type UseAgentReturn } from "./use-agent";

async function mountStub(
  scenario: ScenarioName,
  chunkDelayMs = 0,
): Promise<{
  agent: StubAgent;
  result: UseAgentReturn;
  unmount: () => void;
}> {
  const agent = new StubAgent({ scenario, chunkDelayMs });
  let result!: UseAgentReturn;
  const Harness = () => {
    result = useAgent({ agentFactory: () => agent });
    return null;
  };
  const mounted = render(() => <Harness />);
  await vi.waitFor(() => expect(agent.subscribers).toHaveLength(1));
  return { agent, result, unmount: mounted.unmount };
}

describe("useAgent with StubAgent", () => {
  it("streams assistant messages without an HTTP adapter", async () => {
    const { result } = await mountStub("text-stream");

    await result.send([{ type: "text", text: "Hello" }]);

    expect(result.state.status).toBe("success");
    expect(result.state.messages.at(-1)).toMatchObject({
      id: "stub-text-1",
      role: "assistant",
      content: "Hello, this is a stubbed AG-UI text stream.",
    });
  });

  it("applies state and message snapshots in process", async () => {
    const stateStub = await mountStub("state");
    await stateStub.result.send([{ type: "text", text: "State" }]);
    expect(stateStub.agent.state).toMatchObject({
      counter: 2,
      items: ["first", "second"],
      status: "done",
    });
    stateStub.unmount();

    const messageStub = await mountStub("messages-snapshot");
    await messageStub.result.send([{ type: "text", text: "History" }]);
    expect(messageStub.result.state.messages).toEqual(
      messageStub.agent.messages,
    );
    expect(messageStub.result.state.messages.length).toBeGreaterThan(1);
  });

  it("surfaces protocol errors and interrupts", async () => {
    const errorStub = await mountStub("error");
    await errorStub.result.send([{ type: "text", text: "Fail" }]);
    expect(errorStub.result.state.status).toBe("error");
    expect(errorStub.result.state.error).toBeTruthy();
    errorStub.unmount();

    const interruptStub = await mountStub("interrupt");
    await interruptStub.result.send([{ type: "text", text: "Confirm" }]);
    expect(interruptStub.result.state.status).toBe("awaiting_input");
    expect(interruptStub.result.state.pendingInterrupts).toMatchObject([
      { id: "stub-confirm-1", reason: "confirmation" },
    ]);
  });

  it("aborts a running scenario when its owner is disposed", async () => {
    const { agent, result, unmount } = await mountStub("long-stream", 25);
    void result.send([{ type: "text", text: "Stream" }]);
    await vi.waitFor(() => expect(agent.isRunning).toBe(true));

    unmount();

    await vi.waitFor(() => expect(agent.isRunning).toBe(false));
  });
});
