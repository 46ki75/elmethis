import type { Meta, StoryObj } from "@storybook/react-vite";
import { useClipboard, type UseClipboardOptions } from "./use-clipboard";

import imageUrl from "../assets/bg1.webp";

const UseClipboardDemo = (options: UseClipboardOptions) => {
  const { CopyButton } = useClipboard(options);

  return (
    <div>
      <CopyButton />
    </div>
  );
};

const meta = {
  title: "Hooks/useClipboard",
  component: UseClipboardDemo,
  tags: ["autodocs"],
  args: {
    content: "Hello, World!",
  },
} satisfies Meta<typeof UseClipboardDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { content: "Hello, World!" },
};

const webpToPng = (url: string): Promise<Blob> =>
  fetch(url)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<Blob>((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext("2d")!.drawImage(img, 0, 0);
            canvas.toBlob((png) => resolve(png!), "image/png");
            URL.revokeObjectURL(img.src);
          };
          img.src = URL.createObjectURL(blob);
        }),
    );

export const Image: Story = {
  render: () => {
    const Render = () => {
      const { CopyButton } = useClipboard({
        content: [{ "image/png": webpToPng(imageUrl) }],
      });
      return (
        <div>
          <CopyButton />
        </div>
      );
    };
    return <Render />;
  },
};
