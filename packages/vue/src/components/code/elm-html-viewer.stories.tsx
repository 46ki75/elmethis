import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { ElmHtmlViewer } from "./elm-html-viewer";

const meta = {
  title: "Components/Code/elm-html-viewer",
  component: ElmHtmlViewer,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmHtmlViewer>;

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

/**
 * `src` (remote URL) mode instead of inline `html`. "Open in new tab"
 * navigates straight to the URL; "download" points the download link at it
 * directly (served from this package's `public/fixtures/`).
 */
export const RemoteSrc: Story = {
  args: {
    src: "/fixtures/advanced-rag-pipeline.html",
    allowScripts: true,
  },
};
