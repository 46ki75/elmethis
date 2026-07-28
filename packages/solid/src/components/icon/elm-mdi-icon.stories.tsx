import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmMdiIcon } from "./elm-mdi-icon";
import { mdiArrowAll } from "@mdi/js";

const meta = {
  title: "Components/Icon/elm-mdi-icon",
  component: ElmMdiIcon,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    color: { control: "color" },
    lightColor: { control: "color" },
    darkColor: { control: "color" },
  },
} satisfies Meta<typeof ElmMdiIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    size: "1.25rem",
    d: mdiArrowAll,
  },
};
