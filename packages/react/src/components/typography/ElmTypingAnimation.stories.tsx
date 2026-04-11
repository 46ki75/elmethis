import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmTypingAnimation } from "./ElmTypingAnimation";

const meta: Meta<typeof ElmTypingAnimation> = {
  title: "Components/Typography/ElmTypingAnimation",
  component: ElmTypingAnimation,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    texts: [
      "npm run build",
      "cargo build --release",
      "./gradlew build",
      "./mvnw package",
      "make",
    ],
  },
};
