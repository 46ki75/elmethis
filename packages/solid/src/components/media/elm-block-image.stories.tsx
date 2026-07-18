import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmBlockImage } from "./elm-block-image";

const meta = {
  title: "Components/Media/elm-block-image",
  component: ElmBlockImage,
  tags: ["autodocs"],
  args: {
    src: "https://images.unsplash.com/photo-1556983703-27576e5afa24?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
    enableModal: true,
  },
} satisfies Meta<typeof ElmBlockImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const SrcSet: Story = {
  args: {
    srcSet:
      "https://www.ikuma.cloud/api/v2/blog/leather-shoes-painting/og-image?lang=en 1200w, https://www.ikuma.cloud/api/v2/blog/amazon-bedrock-open-webui/og-image?lang=en 1600w",
    sizes: "(max-width: 1200px) 100vw, 25vw",
  },
};

export const LongCaption: Story = {
  args: {
    caption:
      "Open the image to inspect it at viewport scale. The caption remains attached to the inline block.",
  },
};

export const Invalid: Story = {
  args: { src: "invalid", height: 200, width: 400 },
};
