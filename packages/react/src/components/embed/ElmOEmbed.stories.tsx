import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmOEmbed } from "./ElmOEmbed";

const meta: Meta<typeof ElmOEmbed> = {
  title: "Components/Embed/ElmOEmbed",
  component: ElmOEmbed,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Photo: Story = {
  args: {
    oEmbed: {
      type: "photo",
      url: "https://via.placeholder.com/400x200",
      width: 400,
      height: 200,
      title: "Sample photo",
    },
  },
};

export const Link: Story = {
  args: {
    oEmbed: {
      type: "link",
      title: "GitHub",
      author_name: "GitHub",
      author_url: "https://github.com",
      provider_name: "GitHub",
      provider_url: "https://github.com",
    },
  },
};
