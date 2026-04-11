import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmImage } from "./ElmImage";

const meta: Meta<typeof ElmImage> = {
  title: "Components/Media/ElmImage",
  component: ElmImage,
  tags: ["autodocs"],
  args: {
    src: "https://images.unsplash.com/photo-1556983703-27576e5afa24?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
    block: true,
    enableModal: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Invalid: Story = {
  args: {
    src: "invalid",
  },
};

export const WithAlt: Story = {
  args: {
    alt: "A beautiful photo",
  },
};

export const WithDimensions: Story = {
  args: {
    width: 400,
    height: 100,
    alt: "A landscape image",
  },
};
