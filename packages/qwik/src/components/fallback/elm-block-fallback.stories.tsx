import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmBlockFallback , type ElmBlockFallbackProps} from "./elm-block-fallback";

const meta: Meta<ElmBlockFallbackProps> = {
  title: "Components/Fallback/elm-block-fallback",
  component: ElmBlockFallback,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmBlockFallbackProps>;

export const Primary: Story = {};
