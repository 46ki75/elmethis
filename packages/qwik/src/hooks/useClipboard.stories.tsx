import type { Meta, StoryObj } from "storybook-framework-qwik";
import { useClipboard, type UseClipboardOptions } from "./useClipboard";
import { component$ } from "@qwik.dev/core";

import imageUrl from "../assets/bg1.webp?url";

const meta: Meta<UseClipboardOptions> = {
  title: "Hooks/useClipboard",
  tags: ["autodocs"],
  args: {},
  render: (args) => {
    const Render = component$((options: UseClipboardOptions) => {
      const { CopyButton } = useClipboard(options);

      return (
        <div>
          <CopyButton />
        </div>
      );
    });

    return <Render {...args} />;
  },
};

export default meta;
type Story = StoryObj<UseClipboardOptions>;

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
    const Render = component$(() => {
      const { CopyButton } = useClipboard({
        content: [{ "image/png": webpToPng(imageUrl) }],
      });
      return (
        <div>
          <CopyButton />
        </div>
      );
    });
    return <Render />;
  },
};
