import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmAgUiHttpClient,
  type ElmAgUiHttpClientProps,
} from "./elm-ag-ui-http-client";

const meta: Meta<ElmAgUiHttpClientProps> = {
  title: "Components/Components/elm-ag-ui-http-client",
  component: ElmAgUiHttpClient,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmAgUiHttpClientProps>;

export const Primary: Story = {
  args: {
    url: "http://localhost:4111/ag-ui",
  },
};
