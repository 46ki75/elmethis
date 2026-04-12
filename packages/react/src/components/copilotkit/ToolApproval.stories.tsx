import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";

import { ToolApproval } from "./ToolApproval";

import { ToolCallStatus } from "@copilotkit/react-core/v2";
import { ElmButton } from "@components/form/ElmButton";
import { ElmInlineText } from "@components/typography/ElmInlineText";

const meta: Meta<typeof ToolApproval> = {
  title: "Components/CopilotKit/ToolApproval",
  component: ToolApproval,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

const PrimaryRender = (args: React.ComponentProps<typeof ToolApproval>) => {
  const [status, setStatus] = useState<ToolCallStatus>(
    ToolCallStatus.InProgress,
  );

  const STATUS_SEQUENCE_MAP: Record<ToolCallStatus, ToolCallStatus> = {
    [ToolCallStatus.InProgress]: ToolCallStatus.Executing,
    [ToolCallStatus.Executing]: ToolCallStatus.Complete,
    [ToolCallStatus.Complete]: ToolCallStatus.InProgress,
  } as const;

  const nextStatus = () => {
    setStatus((prev) => STATUS_SEQUENCE_MAP[prev]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
      <div style={{ textAlign: "center" }}>
        <ElmInlineText
          bold={status === ToolCallStatus.InProgress}
          color={status === ToolCallStatus.InProgress ? "#c56565" : undefined}
        >
          InProgress
        </ElmInlineText>
        <ElmInlineText> → </ElmInlineText>
        <ElmInlineText
          bold={status === ToolCallStatus.Executing}
          color={status === ToolCallStatus.Executing ? "#c56565" : undefined}
        >
          Executing
        </ElmInlineText>
        <ElmInlineText> → </ElmInlineText>
        <ElmInlineText
          bold={status === ToolCallStatus.Complete}
          color={status === ToolCallStatus.Complete ? "#c56565" : undefined}
        >
          Complete
        </ElmInlineText>
      </div>

      <ElmButton onClick={nextStatus} style={{ marginBottom: 48 }} block>
        <ElmInlineText>Next</ElmInlineText>
      </ElmButton>

      <ToolApproval {...args} status={status} />
    </div>
  );
};

export const Primary: Story = {
  render: (args) => <PrimaryRender {...args} />,
  args: {
    toolName: "example_tool",
  },
};
