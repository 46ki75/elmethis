import { type Meta, type StoryObj } from "storybook-framework-qwik";
import { ElmMdiIcon, type ElmMdiIconProps } from "./elm-mdi-icon";
import { mdiTag } from "@mdi/js";

const meta: Meta<ElmMdiIconProps> = {
  title: "Components/Icon/elm-mdi-icon",
  component: ElmMdiIcon,
  tags: ["autodocs"],
  argTypes: {
    color: { control: "color" },
    label: {
      control: "text",
      description: "Accessible label rendered as the SVG title.",
    },
  },
  args: {},
};

export default meta;
type Story = StoryObj<ElmMdiIconProps>;

export const Primary: Story = {
  args: {
    size: "1.25rem",
    path: mdiTag,
    label: "Tag",
  },
};
