import type { Meta, StoryObj } from "@storybook/react-vite";
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

export const Primary: Story = {
  render: (args) => (
    <>
      <ElmBlockImage {...args} />
      <div>Some text below the image to demonstrate block display.</div>
    </>
  ),
};

export const SrcSet: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1556983703-27576e5afa24?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
    srcSet:
      "https://www.ikuma.cloud/api/v2/blog/leather-shoes-painting/og-image?lang=en 1200w, https://www.ikuma.cloud/api/v2/blog/amazon-bedrock-open-webui/og-image?lang=en 1600w",
    sizes: "(max-width: 1200px) 100vw, 25vw",
  },
};

export const Svg: Story = {
  args: {
    src: "https://nuxt.com/cdn-cgi/image/w=1024,h=878/assets/landing/deploy.svg",
    alt: "Deploy your app anywhere",
    height: 400,
    width: 800,
  },
};

export const LongAlt: Story = {
  args: {
    src: "https://www.ikuma.cloud/api/v2/blog/leather-shoes-painting/og-image?lang=en",
    caption:
      "One-command deployments and zero-configuration options make it easy to get your Nuxt app live. Choose your platform, and let Nuxt handle the rest, allowing you to focus on building great applications rather than managing complex deployments.",
  },
};

export const Invalid: Story = {
  args: {
    src: "invalid",
    height: 200,
    width: 400,
  },
};
