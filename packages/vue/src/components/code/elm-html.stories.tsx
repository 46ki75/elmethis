import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { ElmHtml } from "./elm-html";

const meta = {
  title: "Components/Code/elm-html",
  component: ElmHtml,
  tags: ["autodocs"],
  args: {
    style: { width: "100%" },
  },
} satisfies Meta<typeof ElmHtml>;

export default meta;

type Story = StoryObj<typeof meta>;

const CLAUDE_ARTIFACT_HTML = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: sans-serif; margin: 1.5rem; }
      h1 { color: #6b4fbb; }
      .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
    </style>
  </head>
  <body>
    <h1>Claude-authored artifact</h1>
    <div class="card">
      <p>This markup (including its own &lt;style&gt;) is rendered as-is inside a sandboxed iframe.</p>
      <button onclick="alert('scripts are blocked by the empty sandbox')">Try me</button>
    </div>
  </body>
</html>
`;

const NOTION_EXPORT_HTML = `
<div class="page-body">
  <h1>Meeting Notes</h1>
  <p>Exported from a Notion page.</p>
  <figure class="callout">
    <div>💡</div>
    <div>Notion wraps callouts in a &lt;figure class="callout"&gt;.</div>
  </figure>
  <ul class="to-do-list">
    <li><span class="checkbox checkbox-on"></span> Ship the pilot</li>
    <li><span class="checkbox checkbox-off"></span> Wire up qwik/vue</li>
  </ul>
</div>
`;

export const ClaudeArtifact: Story = {
  args: {
    html: CLAUDE_ARTIFACT_HTML,
  },
};

export const NotionExport: Story = {
  args: {
    html: NOTION_EXPORT_HTML,
  },
};

const IMAGES_HTML = `
<p>Absolute URL:</p>
<img src="https://picsum.photos/seed/elmethis/200/120" width="200" height="120" />
<p>Relative URL (resolves against the host page, not the HTML's source — breaks unless the source uses absolute URLs):</p>
<img src="./not-a-real-image.png" width="200" height="120" />
<p>Data URI:</p>
<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120'%3E%3Crect width='200' height='120' fill='%236b4fbb'/%3E%3C/svg%3E" width="200" height="120" />
`;

export const Images: Story = {
  args: {
    html: IMAGES_HTML,
  },
};

export const FixedHeight: Story = {
  args: {
    html: CLAUDE_ARTIFACT_HTML,
    autoHeight: false,
    style: { width: "100%", height: "150px" },
  },
};
