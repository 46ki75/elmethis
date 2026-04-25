import type { Meta, StoryObj } from "storybook-framework-qwik";
import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { ElmA2ui, type ElmA2uiProps } from "./elm-a2ui";

const meta: Meta<ElmA2uiProps> = {
  title: "Components/A2UI/elm-a2ui",
  component: ElmA2ui,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Streaming A2UI renderer. Fetches a JSONL endpoint, drives a " +
          "`MessageProcessor`, and delegates rendering to `ElmA2uiRenderer`. " +
          "For pure rendering without HTTP logic, use `ElmA2uiRenderer` directly.",
      },
    },
  },
  argTypes: {
    url: {
      description: "JSONL stream endpoint URL.",
      control: "text",
    },
    headers: {
      description: "Optional HTTP headers forwarded to the stream request.",
      control: "object",
    },
    catalogId: {
      description:
        "A2UI catalog ID. Defaults to the v0.9 standard catalog URI.",
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<ElmA2uiProps>;

// ---- Mock blob-URL story ----

const CATALOG_ID =
  "https://a2ui.org/specification/v0_9/standard_catalog_definition.json";

const MOCK_JSONL = [
  JSON.stringify({
    version: "v0.9",
    createSurface: { surfaceId: "demo", catalogId: CATALOG_ID },
  }),
  JSON.stringify({
    version: "v0.9",
    updateComponents: {
      surfaceId: "demo",
      components: [
        { component: "Column", id: "root", children: ["heading", "body", "row"] },
        { component: "Text",   id: "heading", variant: "h2", text: "ElmA2ui — Live stream demo" },
        {
          component: "Text",
          id: "body",
          text: "This surface was rendered from a static Blob URL that simulates a JSONL stream.",
        },
        { component: "Row",    id: "row",     children: ["btn1", "btn2"] },
        { component: "Button", id: "btn1",    child: "lbl1" },
        { component: "Text",   id: "lbl1",    text: "Cancel" },
        { component: "Button", id: "btn2",    child: "lbl2", primary: true },
        { component: "Text",   id: "lbl2",    text: "Confirm" },
      ],
    },
  }),
].join("\n");

/**
 * Generates a Blob URL from a static JSONL string so the component can be
 * exercised inside Storybook without a real server.
 */
const MockStreamStory = component$(() => {
  const blobUrl = useSignal<string | null>(null);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const blob = new Blob([MOCK_JSONL], { type: "text/plain" });
    blobUrl.value = URL.createObjectURL(blob);
    return () => {
      if (blobUrl.value) URL.revokeObjectURL(blobUrl.value);
    };
  });

  return blobUrl.value ? <ElmA2ui url={blobUrl.value} /> : null;
});

export const MockStream: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders `ElmA2ui` with a static Blob URL that serves pre-built " +
          "JSONL messages — no real server required.",
      },
    },
  },
  render: () => <MockStreamStory />,
};

// ---- API reference placeholder ----

export const ApiReference: Story = {
  args: {
    url: "https://your-server/api/a2ui/stream",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the available props. The component will not render until a " +
          "valid JSONL stream URL is provided.",
      },
    },
  },
};
