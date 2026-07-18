import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmParallax } from "./elm-parallax";

const image =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cpath fill='%236c63ff' d='M0 0h80v80H0zm80 80h80v80H80z'/%3E%3C/svg%3E";
const secondImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Ccircle cx='60' cy='60' r='36' fill='%2300a896'/%3E%3C/svg%3E";

const meta = {
  title: "Components/Containments/elm-parallax",
  component: ElmParallax,
  tags: ["autodocs"],
  args: {
    images: [image, secondImage],
  },
  render: (args) => (
    <div style={{ height: "300vh" }}>
      <ElmParallax {...args} />
    </div>
  ),
} satisfies Meta<typeof ElmParallax>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
