import { render } from "@solidjs/testing-library";
import type { Message } from "@ag-ui/core";
import { describe, expect, it } from "vitest";

import { ElmAgUiInputContent } from "./input-content/elm-ag-ui-input-content";
import { ElmAgUiMessageRenderer } from "./elm-ag-ui-message-renderer";
import { ElmAgUiStatus } from "./elm-ag-ui-status";

describe("Solid AG-UI components", () => {
  it("renders lifecycle states and hides idle", () => {
    const idle = render(() => <ElmAgUiStatus status="idle" />);
    expect(idle.queryByRole("status")).not.toBeInTheDocument();
    idle.unmount();

    const running = render(() => (
      <ElmAgUiStatus status="running" activity="thinking" />
    ));
    expect(running.getByRole("status")).toHaveTextContent("Thinking");
  });

  it("renders multimodal user content", () => {
    const rendered = render(() => (
      <ElmAgUiInputContent
        inputContent={[
          { type: "text", text: "caption" },
          {
            type: "image",
            source: {
              type: "data",
              mimeType: "image/png",
              value: "AAAA",
            },
          },
        ]}
      />
    ));
    expect(rendered.getByText("caption")).toBeInTheDocument();
    expect(
      rendered.getByRole("img", { name: "User attachment" }),
    ).toHaveAttribute("src", "data:image/png;base64,AAAA");
  });

  it("dispatches visible roles and suppresses private roles", () => {
    const messages = [
      { id: "u", role: "user", content: "question" },
      { id: "a", role: "assistant", content: "## answer" },
      { id: "s", role: "system", content: "secret" },
    ] as Message[];
    const rendered = render(() => (
      <ElmAgUiMessageRenderer
        messages={messages}
        isRunning={false}
        handleRetry={() => undefined}
      />
    ));
    expect(rendered.getByText("question")).toBeInTheDocument();
    expect(rendered.getByRole("heading", { level: 2 })).toHaveTextContent(
      "answer",
    );
    expect(rendered.queryByText("secret")).not.toBeInTheDocument();
  });
});
