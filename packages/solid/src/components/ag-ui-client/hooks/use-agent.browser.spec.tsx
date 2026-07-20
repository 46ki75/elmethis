import { render } from "@solidjs/testing-library";
import { StubAgent } from "@elmethis/ag-ui-stub";
import { expect, it, vi } from "vitest";

import { useAgent, type UseAgentReturn } from "./use-agent";

it("runs an AG-UI scenario entirely in the browser", async () => {
  const stub = new StubAgent({ scenario: "text-stream" });
  let agent!: UseAgentReturn;
  const Harness = () => {
    agent = useAgent({ agentFactory: () => stub });
    return null;
  };
  render(() => <Harness />);
  await vi.waitFor(() => expect(stub.subscribers).toHaveLength(1));

  await agent.send([{ type: "text", text: "Hello" }]);

  expect(agent.state.status).toBe("success");
  expect(agent.state.messages.at(-1)).toMatchObject({
    id: "stub-text-1",
    content: "Hello, this is a stubbed AG-UI text stream.",
  });
});
