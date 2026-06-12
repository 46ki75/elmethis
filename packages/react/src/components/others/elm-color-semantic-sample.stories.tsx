import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmColorSemanticSample } from "./elm-color-semantic-sample";

const meta = {
  title: "Components/Others/elm-color-semantic-sample",
  component: ElmColorSemanticSample,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmColorSemanticSample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
