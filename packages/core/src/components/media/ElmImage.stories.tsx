import type { Meta, StoryObj } from "@storybook/vue3";
import ElmImage from "./ElmImage.vue";

const meta: Meta<typeof ElmImage> = {
  title: "Components/Media/ElmImage",
  component: ElmImage,
  tags: ["autodocs"],
  args: {
    src: "https://images.unsplash.com/photo-1556983703-27576e5afa24?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Svg: Story = {
  args: {
    src: "https://nuxt.com/cdn-cgi/image/w=1024,h=878/assets/landing/deploy.svg",
  },
};

export const Modal: Story = {
  args: {
    enableModal: true,
  },
};

export const Invalid: Story = {
  args: {
    src: "invalid",
  },
};
