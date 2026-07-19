import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmAgUiInputContent } from "./elm-ag-ui-input-content";

const meta = {
  title: "Components/AG-UI/Input Content",
  component: ElmAgUiInputContent,
  tags: ["autodocs"],
} satisfies Meta<typeof ElmAgUiInputContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = { args: { inputContent: "A plain user message" } };

export const Image: Story = {
  args: {
    inputContent: [
      { type: "text", text: "An image attachment" },
      {
        type: "image",
        source: {
          type: "url",
          value: "https://picsum.photos/192",
          mimeType: "image/jpeg",
        },
      },
    ],
  },
};

export const Document: Story = {
  args: {
    inputContent: [
      {
        type: "document",
        source: {
          type: "data",
          mimeType: "text/plain",
          value: "A short document body",
        },
      },
    ],
  },
};
