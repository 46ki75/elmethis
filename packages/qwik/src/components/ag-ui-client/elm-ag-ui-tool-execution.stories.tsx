import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmAgUiToolExecution,
  type ElmAgUiToolExecutionProps,
} from "./elm-ag-ui-tool-execution";

const meta: Meta<ElmAgUiToolExecutionProps> = {
  title: "Components/AG-UI/elm-ag-ui-tool-execution",
  component: ElmAgUiToolExecution,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmAgUiToolExecutionProps>;

export const Primary: Story = {
  args: {
    toolName: "aws_knowledge_graph",
  },
};
