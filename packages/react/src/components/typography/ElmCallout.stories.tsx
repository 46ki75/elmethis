import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmCallout } from "./ElmCallout";
import { ElmInlineText } from "./ElmInlineText";
// import { ElmImage } from "../media/ElmImage";

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc tincidunt aliquam. Nullam nec purus nec nunc tincidunt aliquam.";

const meta: Meta<typeof ElmCallout> = {
  title: "Components/Typography/ElmCallout",
  component: ElmCallout,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "radio",
      options: ["note", "tip", "important", "warning", "caution"],
    },
  },
  args: {
    children: <ElmInlineText text={lorem} />,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Tip: Story = {
  args: { type: "tip" },
};

export const Important: Story = {
  args: { type: "important" },
};

export const Warning: Story = {
  args: { type: "warning" },
};

export const Caution: Story = {
  args: { type: "caution" },
};

// export const Nested: Story = {
//   args: { type: "caution" },
//   render(args) {
//     return {
//       components: { ElmCallout, ElmImage },
//       setup() {
//         return { args };
//       },
//       template: `
//         <ElmCallout v-bind="args">
//           <ElmImage src="https://www.pulumi.com/logos/brand/og-default.png" block enableModal />
//         </ElmCallout>
//       `,
//     };
//   },
// };
