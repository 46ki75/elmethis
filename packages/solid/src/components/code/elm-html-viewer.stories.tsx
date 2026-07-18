import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmHtmlViewer } from "./elm-html-viewer";

const meta = {
  title: "Components/Code/elm-html-viewer",
  component: ElmHtmlViewer,
  tags: ["autodocs"],
} satisfies Meta<typeof ElmHtmlViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

const ARTIFACT_HTML = `<!doctype html>
<html><head><style>
body { font-family: sans-serif; margin: 1.5rem; }
h1 { color: #6b4fbb; }
.card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
</style></head><body>
<h1>HTML viewer</h1><div class="card"><p>Inline artifact preview.</p></div>
</body></html>`;

export const InlineHtml: Story = {
  args: { html: ARTIFACT_HTML, filename: "artifact.html" },
};

export const RemoteSrc: Story = {
  args: {
    src: "/fixtures/advanced-rag-pipeline.html",
    allowScripts: true,
    height: 600,
  },
};
