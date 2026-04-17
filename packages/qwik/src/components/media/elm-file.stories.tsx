import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmFile , type ElmFileProps} from "./elm-file";

import file from "../../assets/vite.svg";

const meta: Meta<ElmFileProps> = {
  title: "Components/Media/elm-file",
  component: ElmFile,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmFileProps>;

export const Primary: Story = {
  args: {
    src: file,
    filesize: "1.46 KB",
  },
};

export const Secondary: Story = {
  args: {
    src: file,
  },
};
