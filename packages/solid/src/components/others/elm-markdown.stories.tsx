import {
  createSignal,
  onCleanup,
  onMount,
  type ComponentProps,
} from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmMarkdown } from "./elm-markdown";

const MARKDOWN = `# Markdown

ElmMarkdown maps **GFM tokens** to Elmethis components.

> Completed blocks retain their DOM identity while content streams.

- Typography
- [External links](https://example.com)
- Inline \`code\`

| Feature | Status |
| --- | --- |
| Tables | Supported |
| Raw HTML | Ignored |

\`\`\`typescript
const framework = "Solid";
\`\`\`
`;

const meta = {
  title: "Components/Others/elm-markdown",
  component: ElmMarkdown,
  tags: ["autodocs"],
} satisfies Meta<typeof ElmMarkdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { markdown: MARKDOWN },
};

const NarrowMarkdown = (props: ComponentProps<typeof ElmMarkdown>) => (
  <div style={{ width: "min(100%, 40rem)", margin: "0 auto" }}>
    <ElmMarkdown {...props} />
  </div>
);

export const Article: Story = {
  args: { markdown: MARKDOWN },
  render: (args) => <NarrowMarkdown {...args} />,
};

const StreamingMarkdown = () => {
  const chunks = MARKDOWN.split(/(?<=\s)|(?=\s)/);
  const [markdown, setMarkdown] = createSignal("");

  onMount(() => {
    let index = 0;
    const timer = setInterval(() => {
      const chunk = chunks[index++];
      if (chunk == null) {
        clearInterval(timer);
        return;
      }
      setMarkdown((current) => current + chunk);
    }, 80);

    onCleanup(() => clearInterval(timer));
  });

  return <ElmMarkdown markdown={markdown()} isStreaming />;
};

export const Stream: Story = {
  args: { markdown: "" },
  render: () => <StreamingMarkdown />,
};
