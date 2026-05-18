import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmTooltip, type ElmTooltipProps } from "./elm-tooltip";
import { ElmInlineText } from "../typography/elm-inline-text";

const meta: Meta<ElmTooltipProps> = {
  title: "Components/Containments/elm-tooltip",
  component: ElmTooltip,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmTooltipProps>;

export const Primary: Story = {
  render() {
    return (
      <ElmTooltip {...this.args}>
        <ElmInlineText q:slot="original">HOVER ME</ElmInlineText>
        <ElmInlineText q:slot="tooltip">TOOLTIP</ElmInlineText>
      </ElmTooltip>
    );
  },
};
