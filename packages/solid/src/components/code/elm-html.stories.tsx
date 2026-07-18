import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmHtml } from "./elm-html";

const meta = {
  title: "Components/Code/elm-html",
  component: ElmHtml,
  tags: ["autodocs"],
  args: { style: { width: "100%" } },
} satisfies Meta<typeof ElmHtml>;

export default meta;
type Story = StoryObj<typeof meta>;

const ARTIFACT_HTML = `<!doctype html>
<html><head><style>
body { font-family: sans-serif; margin: 1.5rem; }
h1 { color: #6b4fbb; }
.card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
</style></head><body>
<h1>Claude-authored artifact</h1>
<div class="card"><p>Rendered as-is in a sandboxed iframe.</p></div>
</body></html>`;

export const ClaudeArtifact: Story = { args: { html: ARTIFACT_HTML } };

export const FixedHeight: Story = {
  args: {
    html: ARTIFACT_HTML,
    autoHeight: false,
    style: "width:100%;height:150px",
  },
};

export const AllowScripts: Story = {
  args: {
    allowScripts: true,
    html: `<p>Counter: <span id="count">0</span></p>
<button onclick="count.textContent = Number(count.textContent) + 1">Increment</button>`,
  },
};

export const RemoteSrc: Story = {
  args: {
    src: "/fixtures/advanced-rag-pipeline.html",
    allowScripts: true,
    height: 600,
  },
};
