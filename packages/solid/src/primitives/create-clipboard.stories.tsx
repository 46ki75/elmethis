import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { createClipboard } from "./create-clipboard";

const ClipboardDemo = (props: { content: string; delay: number }) => {
  const clipboard = createClipboard({
    get content() {
      return props.content;
    },
    get delay() {
      return props.delay;
    },
  });
  const [error, setError] = createSignal("");

  const copy = async () => {
    setError("");
    try {
      await clipboard.copy();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  return (
    <div style={{ display: "grid", gap: "0.75rem", "max-width": "28rem" }}>
      <code>{props.content}</code>
      <button type="button" onClick={copy}>
        {clipboard.copied() ? "Copied" : "Copy to clipboard"}
      </button>
      {error() && <output style={{ color: "crimson" }}>{error()}</output>}
    </div>
  );
};

const meta = {
  title: "Primitives/createClipboard",
  component: ClipboardDemo,
  tags: ["autodocs"],
  args: {
    content: "Hello from Elmethis Solid",
    delay: 1500,
  },
} satisfies Meta<typeof ClipboardDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {};

export const RichText: Story = {
  render: () => {
    const RichTextDemo = () => {
      const clipboard = createClipboard({
        content: [
          {
            "text/plain": new Blob(["Elmethis rich text"]),
            "text/html": new Blob(["<strong>Elmethis rich text</strong>"], {
              type: "text/html",
            }),
          },
        ],
      });
      const [error, setError] = createSignal("");

      const copy = async () => {
        setError("");
        try {
          await clipboard.copy();
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : String(reason));
        }
      };

      return (
        <div style={{ display: "grid", gap: "0.75rem", "max-width": "28rem" }}>
          <button type="button" onClick={copy}>
            {clipboard.copied() ? "Copied rich text" : "Copy rich text"}
          </button>
          {error() && <output style={{ color: "crimson" }}>{error()}</output>}
        </div>
      );
    };

    return <RichTextDemo />;
  },
};
