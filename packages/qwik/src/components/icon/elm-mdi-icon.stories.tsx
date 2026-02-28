import { type Meta, type StoryObj } from "storybook-framework-qwik";
import { ElmMdiIcon } from "./elm-mdi-icon";
import { mdiTag } from "@mdi/js";

const meta: Meta<typeof ElmMdiIcon> = {
  title: "Components/Icon/elm-mdi-icon",
  component: ElmMdiIcon,
  tags: ["autodocs"],
  argTypes: {
    color: { control: "color" },
    lightColor: { control: "color" },
    darkColor: { control: "color" },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    size: "1.25rem",
    d: mdiTag,
  },
};
