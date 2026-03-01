import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmBlockImage } from "./elm-block-image";

import landscape from "../../assets/images/lamdscape.svg?url";
import portrait from "../../assets/images/portrait.svg?url";
import square from "../../assets/images/square.svg?url";

const meta: Meta<typeof ElmBlockImage> = {
  title: "Components/Media/elm-block-image",
  component: ElmBlockImage,
  tags: ["autodocs"],
  args: {
    src: "https://images.unsplash.com/photo-1556983703-27576e5afa24?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
    block: true,
    enableModal: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render() {
    return (
      <>
        <ElmBlockImage {...this.args} />
        <div>Some text below the image to demonstrate block display.</div>
      </>
    );
  },
};

export const Svg: Story = {
  args: {
    src: "https://nuxt.com/cdn-cgi/image/w=1024,h=878/assets/landing/deploy.svg",
    alt: "Deploy your app anywhere",
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
  },
};

export const Landscape: Story = {
  args: {
    src: landscape,
    caption: "A landscape image",
    width: 400,
    height: 100,
  },
};

export const Portrait: Story = {
  args: {
    src: portrait,
    caption: "A portrait image",
    width: 100,
    height: 200,
  },
};

export const Square: Story = {
  args: {
    src: square,
    caption: "A square image",
    width: 200,
    height: 200,
  },
};
