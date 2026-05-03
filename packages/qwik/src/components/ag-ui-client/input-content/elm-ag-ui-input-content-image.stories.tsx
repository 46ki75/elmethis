import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmAgUiInputContentImage,
  type ElmAgUiInputContentImageProps,
} from "./elm-ag-ui-input-content-image";

import ViteIcon from "../../../assets/vite.svg?url";
import ViteIconRaw from "../../../assets/vite.svg?raw";

import md from "../../../../README.md?raw";

const meta: Meta<ElmAgUiInputContentImageProps> = {
  title: "Components/AG-UI/InputContent/elm-ag-ui-input-content-image",
  component: ElmAgUiInputContentImage,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmAgUiInputContentImageProps>;

export const Primary: Story = {
  args: {
    inputContent: {
      type: "image",
      source: {
        type: "url",
        value: ViteIcon,
      },
    },
  },
};

const base64Image = btoa(ViteIconRaw);

export const WithDataUrl: Story = {
  args: {
    inputContent: {
      type: "image",
      source: {
        type: "data",
        mimeType: "image/svg+xml",
        value: base64Image,
      },
    },
  },
};

export const TextInputContent: Story = {
  args: {
    inputContent: {
      type: "text",
      text: md,
    },
  },
};
