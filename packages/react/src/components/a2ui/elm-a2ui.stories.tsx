import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";

import { ElmA2ui } from "./elm-a2ui";

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

const meta = {
  title: "Components/A2UI/elm-a2ui",
  component: ElmA2ui,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A2UI v0.9 renderer. Accepts either a JSONL stream `url` or a " +
          "pre-collected `messages` array of A2UI protocol messages — the " +
          "component manages the `MessageProcessor` internally and renders " +
          "each surface through the official `@a2ui/react` host. The default " +
          "catalog is the Elm block catalog (official basic primitives + the " +
          "project's `Elm*` block renderers).",
      },
    },
  },
} satisfies Meta<typeof ElmA2ui>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Static stories (basic catalog primitives)
// ---------------------------------------------------------------------------

export const Typography: Story = {
  render: () => (
    <ElmA2ui
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "typography", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "typography",
            components: [
              {
                component: "Column",
                id: "root",
                children: ["h1", "h2", "h3", "h4", "h5", "body", "caption"],
              },
              { component: "Text", id: "h1", variant: "h1", text: "Heading 1" },
              { component: "Text", id: "h2", variant: "h2", text: "Heading 2" },
              { component: "Text", id: "h3", variant: "h3", text: "Heading 3" },
              { component: "Text", id: "h4", variant: "h4", text: "Heading 4" },
              { component: "Text", id: "h5", variant: "h5", text: "Heading 5" },
              {
                component: "Text",
                id: "body",
                variant: "body",
                text: "Body text — the default paragraph style.",
              },
              {
                component: "Text",
                id: "caption",
                variant: "caption",
                text: "Caption text — small, muted.",
              },
            ],
          },
        },
      ]}
    />
  ),
};

export const Layout: Story = {
  render: () => (
    <ElmA2ui
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "layout", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "layout",
            components: [
              {
                component: "Column",
                id: "root",
                children: ["rowLabel", "row", "colLabel", "col"],
              },
              {
                component: "Text",
                id: "rowLabel",
                variant: "h4",
                text: "Row (spaceBetween)",
              },
              {
                component: "Row",
                id: "row",
                justify: "spaceBetween",
                children: ["a", "b", "c"],
              },
              { component: "Text", id: "a", text: "Alpha" },
              { component: "Text", id: "b", text: "Beta" },
              { component: "Text", id: "c", text: "Gamma" },
              {
                component: "Text",
                id: "colLabel",
                variant: "h4",
                text: "Column (start)",
              },
              { component: "Column", id: "col", children: ["x", "y", "z"] },
              { component: "Text", id: "x", text: "First" },
              { component: "Text", id: "y", text: "Second" },
              { component: "Text", id: "z", text: "Third" },
            ],
          },
        },
      ]}
    />
  ),
};

export const Card: Story = {
  render: () => (
    <ElmA2ui
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "card", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "card",
            components: [
              { component: "Card", id: "root", child: "inner" },
              { component: "Column", id: "inner", children: ["title", "body"] },
              {
                component: "Text",
                id: "title",
                variant: "h3",
                text: "Card Title",
              },
              {
                component: "Text",
                id: "body",
                text: "This is the card body. Cards have a border, rounded corners, and a subtle shadow.",
              },
            ],
          },
        },
      ]}
    />
  ),
};

export const Buttons: Story = {
  render: () => (
    <ElmA2ui
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "buttons", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "buttons",
            components: [
              { component: "Row", id: "root", children: ["btn1", "btn2"] },
              { component: "Button", id: "btn1", child: "lbl1" },
              { component: "Text", id: "lbl1", text: "Default" },
              {
                component: "Button",
                id: "btn2",
                child: "lbl2",
                variant: "primary",
              },
              { component: "Text", id: "lbl2", text: "Primary" },
            ],
          },
        },
      ]}
    />
  ),
};

export const FormFields: Story = {
  render: () => (
    <ElmA2ui
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "form", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "form",
            components: [
              {
                component: "Column",
                id: "root",
                children: ["tf1", "tf2", "tf3", "check", "slider"],
              },
              {
                component: "TextField",
                id: "tf1",
                label: "Short text",
                value: "",
                variant: "shortText",
              },
              {
                component: "TextField",
                id: "tf2",
                label: "Password",
                value: "",
                variant: "obscured",
              },
              {
                component: "TextField",
                id: "tf3",
                label: "Number",
                value: "42",
                variant: "number",
              },
              {
                component: "CheckBox",
                id: "check",
                label: "Enable feature",
                value: true,
              },
              {
                component: "Slider",
                id: "slider",
                min: 0,
                max: 100,
                value: 60,
              },
            ],
          },
        },
      ]}
    />
  ),
};

export const Tabs: Story = {
  render: () => (
    <ElmA2ui
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "tabs", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "tabs",
            components: [
              {
                component: "Tabs",
                id: "root",
                tabs: [
                  { title: "Overview", child: "tab1" },
                  { title: "Details", child: "tab2" },
                  { title: "History", child: "tab3" },
                ],
              },
              {
                component: "Text",
                id: "tab1",
                text: "Overview content goes here.",
              },
              { component: "Text", id: "tab2", text: "Detailed information." },
              { component: "Text", id: "tab3", text: "Historical data." },
            ],
          },
        },
      ]}
    />
  ),
};

// ---------------------------------------------------------------------------
// Block catalog (Elm component renderers)
// ---------------------------------------------------------------------------

export const BlockCatalog: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The Elm block renderers: an agent emits the project's own component " +
          "types (Heading, Paragraph, Callout, CodeBlock) which render as " +
          "styled `Elm*` components rather than the basic primitives.",
      },
    },
  },
  render: () => (
    <ElmA2ui
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "block", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "block",
            components: [
              {
                component: "Column",
                id: "root",
                children: ["h", "p", "callout", "code"],
              },
              { component: "Heading", id: "h", level: 2, children: ["ht"] },
              { component: "Text", id: "ht", text: "Block Heading" },
              { component: "Paragraph", id: "p", children: ["pt"] },
              {
                component: "Text",
                id: "pt",
                text: "A paragraph rendered by ElmParagraph.",
              },
              {
                component: "Callout",
                id: "callout",
                type: "tip",
                children: ["ct"],
              },
              {
                component: "Text",
                id: "ct",
                text: "This is an ElmCallout of type tip.",
              },
              {
                component: "CodeBlock",
                id: "code",
                language: "ts",
                code: "const greet = (name: string) => `Hello, ${name}!`;",
              },
            ],
          },
        },
      ]}
    />
  ),
};

// ---------------------------------------------------------------------------
// Streaming stories — progressive message delivery
// ---------------------------------------------------------------------------

/**
 * Schedules messages to be appended one by one at `delay` ms intervals.
 * Returns a cleanup function that cancels pending timers.
 */
function scheduleMessages(
  onUpdate: (msgs: object[]) => void,
  messages: object[],
  delay: number,
): () => void {
  let current: object[] = [];
  const timers = messages.map((msg, i) =>
    setTimeout(() => {
      current = [...current, msg];
      onUpdate(current);
    }, i * delay),
  );
  return () => timers.forEach(clearTimeout);
}

const MockStreamStory = () => {
  const [msgs, setMsgs] = useState<object[]>([]);
  useEffect(() => {
    const SID = "demo";
    return scheduleMessages(
      setMsgs,
      [
        {
          version: "v0.9",
          createSurface: { surfaceId: SID, catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: SID,
            components: [
              { component: "Column", id: "root", children: ["heading"] },
              {
                component: "Text",
                id: "heading",
                variant: "h2",
                text: "Streaming UI",
              },
            ],
          },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: SID,
            components: [
              {
                component: "Column",
                id: "root",
                children: ["heading", "body"],
              },
              {
                component: "Text",
                id: "body",
                text: "Each message arrives 800 ms after the previous one.",
              },
            ],
          },
        },
        {
          version: "v0.9",
          updateDataModel: {
            surfaceId: SID,
            path: "/form/name",
            value: "Ada Lovelace",
          },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: SID,
            components: [
              {
                component: "Column",
                id: "root",
                children: ["heading", "body", "field"],
              },
              {
                component: "TextField",
                id: "field",
                label: "Name",
                value: { path: "/form/name" },
              },
            ],
          },
        },
        {
          version: "v0.9",
          updateDataModel: {
            surfaceId: SID,
            path: "/form/name",
            value: "Grace Hopper",
          },
        },
      ],
      800,
    );
  }, []);

  return <ElmA2ui messages={msgs} />;
};

export const MockStream: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Progressive build-up: one message arrives every 800 ms. The final " +
          "steps demonstrate data binding — a `TextField` bound to " +
          "`/form/name`, then an `updateDataModel` that changes the value " +
          "without touching component structure.",
      },
    },
  },
  render: () => <MockStreamStory />,
};

const StreamingTextStory = () => {
  const [msgs, setMsgs] = useState<object[]>([]);
  useEffect(() => {
    const SID = "stream-text";
    const words = [
      "Streaming",
      "Streaming text",
      "Streaming text is",
      "Streaming text is rendered",
      "Streaming text is rendered word by word.",
    ];
    return scheduleMessages(
      setMsgs,
      [
        {
          version: "v0.9",
          createSurface: { surfaceId: SID, catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateDataModel: { surfaceId: SID, path: "/output", value: "" },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: SID,
            components: [
              {
                component: "Column",
                id: "root",
                children: ["prompt", "output"],
              },
              {
                component: "Text",
                id: "prompt",
                variant: "h4",
                text: "Prompt: What is A2UI streaming?",
              },
              { component: "Text", id: "output", text: { path: "/output" } },
            ],
          },
        },
        ...words.map((value) => ({
          version: "v0.9",
          updateDataModel: { surfaceId: SID, path: "/output", value },
        })),
      ],
      400,
    );
  }, []);

  return <ElmA2ui messages={msgs} />;
};

export const StreamingText: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Simulates an agent streaming a response token by token. A single " +
          "`Text` is bound to `/output`; repeated `updateDataModel` messages " +
          "grow the string. Component structure never changes after setup.",
      },
    },
  },
  render: () => <StreamingTextStory />,
};

const COUNTER_SID = "counter";

const LiveCounterStory = () => {
  // Seed the initial tree in the state initializer (not an effect) so the
  // interval below is the only state writer.
  const [msgs, setMsgs] = useState<object[]>(() => [
    {
      version: "v0.9",
      createSurface: { surfaceId: COUNTER_SID, catalogId: CATALOG_ID },
    },
    {
      version: "v0.9",
      updateDataModel: { surfaceId: COUNTER_SID, path: "/n", value: 0 },
    },
    {
      version: "v0.9",
      updateComponents: {
        surfaceId: COUNTER_SID,
        components: [
          { component: "Column", id: "root", children: ["label", "value"] },
          {
            component: "Text",
            id: "label",
            variant: "h4",
            text: "Live counter",
          },
          {
            component: "Text",
            id: "value",
            variant: "h1",
            text: { path: "/n" },
          },
        ],
      },
    },
  ]);
  useEffect(() => {
    let n = 0;
    const handle = setInterval(() => {
      n += 1;
      setMsgs((prev) => [
        ...prev,
        {
          version: "v0.9",
          updateDataModel: { surfaceId: COUNTER_SID, path: "/n", value: n },
        },
      ]);
    }, 600);
    return () => clearInterval(handle);
  }, []);

  return <ElmA2ui messages={msgs} />;
};

export const LiveCounter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Minimal data-binding demo: a single `Text` bound to `/n`, with a " +
          "tick every 600 ms pushing an `updateDataModel`. The tree is built " +
          "once; every subsequent frame is data-only.",
      },
    },
  },
  render: () => <LiveCounterStory />,
};

const DeleteSurfaceStory = () => {
  const [msgs, setMsgs] = useState<object[]>([]);
  useEffect(() => {
    return scheduleMessages(
      setMsgs,
      [
        {
          version: "v0.9",
          createSurface: { surfaceId: "toast", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "toast",
            components: [
              { component: "Card", id: "root", child: "inner" },
              { component: "Column", id: "inner", children: ["t", "b"] },
              {
                component: "Text",
                id: "t",
                variant: "h5",
                text: "Toast notification",
              },
              {
                component: "Text",
                id: "b",
                text: "This surface will be removed in ~2 s.",
              },
            ],
          },
        },
        { version: "v0.9", deleteSurface: { surfaceId: "toast" } },
        {
          version: "v0.9",
          createSurface: { surfaceId: "after", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "after",
            components: [
              {
                component: "Text",
                id: "root",
                variant: "caption",
                text: "Toast dismissed.",
              },
            ],
          },
        },
      ],
      2000,
    );
  }, []);

  return <ElmA2ui messages={msgs} />;
};

export const DeleteSurface: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates `deleteSurface`. A toast Card appears, then 2 s later a " +
          "`deleteSurface` removes it. A follow-up caption confirms the " +
          "renderer recovers and keeps processing.",
      },
    },
  },
  render: () => <DeleteSurfaceStory />,
};
