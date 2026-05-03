import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmAgUiInputContent,
  type ElmAgUiInputContentImageProps,
} from "./elm-ag-ui-input-content";

import ViteIcon from "../../../assets/vite.svg?url";
import ViteIconRaw from "../../../assets/vite.svg?raw";

import md from "../../../../README.md?raw";

const meta: Meta<ElmAgUiInputContentImageProps> = {
  title: "Components/AG-UI/InputContent/elm-ag-ui-input-content",
  component: ElmAgUiInputContent,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmAgUiInputContentImageProps>;

export const Primary: Story = {
  args: {
    inputContent: [
      {
        type: "image",
        source: {
          type: "url",
          value: ViteIcon,
        },
      },
    ],
  },
};

const base64Image = btoa(ViteIconRaw);

export const WithDataUrl: Story = {
  args: {
    inputContent: [
      {
        type: "image",
        source: {
          type: "data",
          mimeType: "image/svg+xml",
          value: base64Image,
        },
      },
      {
        type: "image",
        source: {
          type: "data",
          mimeType: "image/svg+xml",
          value: base64Image,
        },
      },
    ],
  },
};

export const TextInputContent: Story = {
  args: {
    inputContent: md,
  },
};

export const DocumentInputContent: Story = {
  args: {
    inputContent: [
      {
        type: "document",
        source: {
          type: "data",
          mimeType: "text/markdown",
          value: md,
        },
      },
    ],
  },
};
