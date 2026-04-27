import type { Meta, StoryObj } from "storybook-framework-qwik";
import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import {
  ElmA2uiRenderer,
  type ElmA2uiRendererProps,
} from "./elm-a2ui-renderer";

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

const meta: Meta<ElmA2uiRendererProps> = {
  title: "Components/A2UI/elm-a2ui-renderer",
  component: ElmA2uiRenderer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Pure UI renderer for A2UI v0.9 messages. " +
          "Pass a `messages` array of A2UI protocol messages; the component " +
          "manages the MessageProcessor internally.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<ElmA2uiRendererProps>;

export const Typography: Story = {
  parameters: {
    docs: {
      description: {
        story: "All Text component variants: h1–h5, body, and caption.",
      },
    },
  },
  render: () => (
    <ElmA2uiRenderer
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
  parameters: {
    docs: {
      description: { story: "Row and Column containers with nested children." },
    },
  },
  render: () => (
    <ElmA2uiRenderer
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
  parameters: {
    docs: {
      description: { story: "Card container wrapping a Column of text." },
    },
  },
  render: () => (
    <ElmA2uiRenderer
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
  parameters: {
    docs: {
      description: { story: "Default and primary Button variants." },
    },
  },
  render: () => (
    <ElmA2uiRenderer
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
  parameters: {
    docs: {
      description: {
        story: "TextField (text / password / number), CheckBox, and Slider.",
      },
    },
  },
  render: () => (
    <ElmA2uiRenderer
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

export const List: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "List component with a data-driven template list (`children.componentId` + `path`).",
      },
    },
  },
  render: () => (
    <ElmA2uiRenderer
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "list", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateDataModel: {
            surfaceId: "list",
            path: "/items",
            value: [
              { label: "Apple" },
              { label: "Banana" },
              { label: "Cherry" },
              { label: "Durian" },
            ],
          },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "list",
            components: [
              {
                component: "List",
                id: "root",
                children: { componentId: "item", path: "/items" },
              },
              { component: "Card", id: "item", child: "itemText" },
              { component: "Text", id: "itemText", text: { path: "label" } },
            ],
          },
        },
      ]}
    />
  ),
};

export const Divider: Story = {
  parameters: {
    docs: {
      description: { story: "Horizontal and vertical Divider variants." },
    },
  },
  render: () => (
    <ElmA2uiRenderer
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "divider", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "divider",
            components: [
              {
                component: "Column",
                id: "root",
                children: ["a", "div1", "b", "row"],
              },
              { component: "Text", id: "a", text: "Above" },
              { component: "Divider", id: "div1" },
              { component: "Text", id: "b", text: "Below" },
              {
                component: "Row",
                id: "row",
                children: ["left", "div2", "right"],
              },
              { component: "Text", id: "left", text: "Left" },
              { component: "Divider", id: "div2", axis: "vertical" },
              { component: "Text", id: "right", text: "Right" },
            ],
          },
        },
      ]}
    />
  ),
};

export const Tabs: Story = {
  parameters: {
    docs: {
      description: {
        story: "Tabs component — currently renders the first tab's content.",
      },
    },
  },
  render: () => (
    <ElmA2uiRenderer
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
                  { title: "Nested", child: "tab4" },
                ],
              },
              {
                component: "Text",
                id: "tab1",
                text: "Overview content goes here.",
              },
              { component: "Text", id: "tab2", text: "Detailed information." },
              { component: "Text", id: "tab3", text: "Historical data." },
              {
                component: "Tabs",
                id: "tab4",
                tabs: [
                  { title: "Overview", child: "tab1" },
                  { title: "Details", child: "tab2" },
                  { title: "History", child: "tab3" },
                ],
              },
            ],
          },
        },
      ]}
    />
  ),
};

export const ChoicePicker: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "ChoicePicker component — mutually exclusive (radio) and multiple selection (checkbox) variants. " +
          "The `value` prop is a string array bound to the data model.",
      },
    },
  },
  render: () => (
    <ElmA2uiRenderer
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "choice", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateDataModel: {
            surfaceId: "choice",
            path: "/form/color",
            value: ["blue"],
          },
        },
        {
          version: "v0.9",
          updateDataModel: {
            surfaceId: "choice",
            path: "/form/toppings",
            value: ["cheese"],
          },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "choice",
            components: [
              {
                component: "Column",
                id: "root",
                children: ["label1", "single", "label2", "multi"],
              },
              {
                component: "Text",
                id: "label1",
                variant: "h5",
                text: "Mutually exclusive",
              },
              {
                component: "ChoicePicker",
                id: "single",
                variant: "mutuallyExclusive",
                options: [
                  { label: "Red", value: "red" },
                  { label: "Green", value: "green" },
                  { label: "Blue", value: "blue" },
                ],
                value: { path: "/form/color" },
              },
              {
                component: "Text",
                id: "label2",
                variant: "h5",
                text: "Multiple selection",
              },
              {
                component: "ChoicePicker",
                id: "multi",
                variant: "multipleSelection",
                options: [
                  { label: "Cheese", value: "cheese" },
                  { label: "Mushrooms", value: "mushrooms" },
                  { label: "Peppers", value: "peppers" },
                ],
                value: { path: "/form/toppings" },
              },
            ],
          },
        },
      ]}
    />
  ),
};

export const DateTimeInput: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "DateTimeInput component — date-only, time-only, and combined datetime-local variants.",
      },
    },
  },
  render: () => (
    <ElmA2uiRenderer
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "datetime", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateDataModel: {
            surfaceId: "datetime",
            path: "/form/date",
            value: "2025-01-15",
          },
        },
        {
          version: "v0.9",
          updateDataModel: {
            surfaceId: "datetime",
            path: "/form/time",
            value: "09:30",
          },
        },
        {
          version: "v0.9",
          updateDataModel: {
            surfaceId: "datetime",
            path: "/form/datetime",
            value: "2025-01-15T09:30",
          },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "datetime",
            components: [
              {
                component: "Column",
                id: "root",
                children: ["dateField", "timeField", "datetimeField"],
              },
              {
                component: "DateTimeInput",
                id: "dateField",
                label: "Date",
                enableDate: true,
                value: { path: "/form/date" },
              },
              {
                component: "DateTimeInput",
                id: "timeField",
                label: "Time",
                enableTime: true,
                value: { path: "/form/time" },
              },
              {
                component: "DateTimeInput",
                id: "datetimeField",
                label: "Date & Time",
                enableDate: true,
                enableTime: true,
                value: { path: "/form/datetime" },
              },
            ],
          },
        },
      ]}
    />
  ),
};

// ---- Streaming stories ----
// These stories demonstrate progressive message delivery using ElmA2uiRenderer's
// incremental processing: messages.length is tracked, and only newly appended
// entries are processed on each render.

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

// ---- MockStream ----

const MockStreamStory = component$(() => {
  const msgs = useSignal<object[]>([]);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const SID = "demo";
    cleanup(
      scheduleMessages(
        (m) => {
          msgs.value = m;
        },
        [
          // 1. Create the surface
          {
            version: "v0.9",
            createSurface: { surfaceId: SID, catalogId: CATALOG_ID },
          },
          // 2. Heading
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
          // 3. Body text
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
          // 4. Buttons
          {
            version: "v0.9",
            updateComponents: {
              surfaceId: SID,
              components: [
                {
                  component: "Column",
                  id: "root",
                  children: ["heading", "body", "row"],
                },
                { component: "Row", id: "row", children: ["btn1", "btn2"] },
                { component: "Button", id: "btn1", child: "lbl1" },
                { component: "Text", id: "lbl1", text: "Cancel" },
                {
                  component: "Button",
                  id: "btn2",
                  child: "lbl2",
                  variant: "primary",
                },
                { component: "Text", id: "lbl2", text: "Confirm" },
              ],
            },
          },
          // 5. Pre-fill data model, then add a bound TextField
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
                  children: ["heading", "body", "row", "field"],
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
          // 6. Server pushes a new value — TextField re-renders via data binding
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
      ),
    );
  });

  return <ElmA2uiRenderer messages={msgs.value} />;
});

export const MockStream: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Progressive component build-up: one message arrives every 800 ms. " +
          "Steps 5–6 demonstrate dynamic data binding — a `TextField` is bound " +
          "to `/form/name` in the `DataModel`, then a subsequent `updateDataModel` " +
          "message updates the value without touching component structure.",
      },
    },
  },
  render: () => <MockStreamStory />,
};

// ---- StreamingText ----

const StreamingTextStory = component$(() => {
  const msgs = useSignal<object[]>([]);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const SID = "stream-text";
    const words = [
      "Streaming",
      "Streaming text",
      "Streaming text is",
      "Streaming text is rendered",
      "Streaming text is rendered word",
      "Streaming text is rendered word by word",
      "Streaming text is rendered word by word via repeated updateDataModel messages.",
    ];
    cleanup(
      scheduleMessages(
        (m) => {
          msgs.value = m;
        },
        [
          {
            version: "v0.9",
            createSurface: { surfaceId: SID, catalogId: CATALOG_ID },
          },
          // Initialise binding target before the Text component mounts
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
                  children: ["prompt", "div", "output"],
                },
                {
                  component: "Text",
                  id: "prompt",
                  variant: "h4",
                  text: "Prompt: What is A2UI streaming?",
                },
                { component: "Divider", id: "div" },
                // text is a dynamic binding — each updateDataModel below updates this value
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
      ),
    );
  });

  return <ElmA2uiRenderer messages={msgs.value} />;
});

export const StreamingText: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Simulates an AI agent streaming a response token by token. " +
          "A single `Text` component is bound to `/output`; the server sends " +
          "repeated `updateDataModel` messages every 400 ms that grow the string " +
          "one word at a time. Component structure never changes after the initial " +
          "`updateComponents`.",
      },
    },
  },
  render: () => <StreamingTextStory />,
};

// ---- GrowingList ----

const GrowingListStory = component$(() => {
  const msgs = useSignal<object[]>([]);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const SID = "growing-list";
    const results = [
      {
        title: "Introduction to A2UI",
        desc: "Overview of the agent-driven UI protocol.",
      },
      {
        title: "Dynamic Data Binding",
        desc: "How { path } bindings connect components to the DataModel.",
      },
      {
        title: "Streaming Patterns",
        desc: "Progressive rendering via JSONL streams.",
      },
      {
        title: "Component Lifecycle",
        desc: "createSurface, updateComponents, and deleteSurface.",
      },
    ];
    cleanup(
      scheduleMessages(
        (m) => {
          msgs.value = m;
        },
        [
          {
            version: "v0.9",
            createSurface: { surfaceId: SID, catalogId: CATALOG_ID },
          },
          // Start with an empty array so the List renders immediately (empty)
          {
            version: "v0.9",
            updateDataModel: { surfaceId: SID, path: "/results", value: [] },
          },
          {
            version: "v0.9",
            updateComponents: {
              surfaceId: SID,
              components: [
                {
                  component: "Column",
                  id: "root",
                  children: ["heading", "list"],
                },
                {
                  component: "Text",
                  id: "heading",
                  variant: "h3",
                  text: "Search Results",
                },
                // List template: one "row" component is instantiated per /results element
                {
                  component: "List",
                  id: "list",
                  children: { componentId: "row", path: "/results" },
                },
                { component: "Card", id: "row", child: "rowInner" },
                {
                  component: "Column",
                  id: "rowInner",
                  children: ["rowTitle", "rowDesc"],
                },
                // Relative paths resolve within each item's basePath (e.g. /results/0)
                {
                  component: "Text",
                  id: "rowTitle",
                  variant: "h5",
                  text: { path: "title" },
                },
                { component: "Text", id: "rowDesc", text: { path: "desc" } },
              ],
            },
          },
          // Grow the array one item at a time — the List re-renders with each update
          ...results.map((_, i) => ({
            version: "v0.9",
            updateDataModel: {
              surfaceId: SID,
              path: "/results",
              value: results.slice(0, i + 1),
            },
          })),
        ],
        900,
      ),
    );
  });

  return <ElmA2uiRenderer messages={msgs.value} />;
});

export const GrowingList: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Simulates search results streaming in one item at a time. " +
          "A `List` uses a template binding (`children.componentId` + `path`) " +
          "driven entirely by the `/results` array. Every 900 ms one more item " +
          "is appended via `updateDataModel` — no `updateComponents` needed after " +
          "the initial setup.",
      },
    },
  },
  render: () => <GrowingListStory />,
};

// ---- ComponentSwap ----

const ComponentSwapStory = component$(() => {
  const msgs = useSignal<object[]>([]);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const SID = "swap";
    cleanup(
      scheduleMessages(
        (m) => {
          msgs.value = m;
        },
        [
          {
            version: "v0.9",
            createSurface: { surfaceId: SID, catalogId: CATALOG_ID },
          },
          // 1. Loading placeholder
          {
            version: "v0.9",
            updateComponents: {
              surfaceId: SID,
              components: [
                { component: "Column", id: "root", children: ["loading"] },
                {
                  component: "Text",
                  id: "loading",
                  variant: "caption",
                  text: "Loading…",
                },
              ],
            },
          },
          // 2. Replace placeholder with real content in a single updateComponents
          {
            version: "v0.9",
            updateComponents: {
              surfaceId: SID,
              components: [
                { component: "Column", id: "root", children: ["card"] },
                { component: "Card", id: "card", child: "cardInner" },
                {
                  component: "Column",
                  id: "cardInner",
                  children: ["title", "body", "actions"],
                },
                {
                  component: "Text",
                  id: "title",
                  variant: "h3",
                  text: "Content Loaded",
                },
                {
                  component: "Text",
                  id: "body",
                  text: "The agent replaced the loading placeholder with real content in a single updateComponents message.",
                },
                {
                  component: "Row",
                  id: "actions",
                  children: ["btnDismiss", "btnView"],
                },
                { component: "Button", id: "btnDismiss", child: "lblDismiss" },
                { component: "Text", id: "lblDismiss", text: "Dismiss" },
                {
                  component: "Button",
                  id: "btnView",
                  child: "lblView",
                  variant: "primary",
                },
                { component: "Text", id: "lblView", text: "View Details" },
              ],
            },
          },
        ],
        1200,
      ),
    );
  });

  return <ElmA2uiRenderer messages={msgs.value} />;
});

export const ComponentSwap: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates how an agent replaces a loading placeholder with real " +
          "content. The first `updateComponents` renders a caption text " +
          '(`"Loading…"`). After 1.2 s a second `updateComponents` rewrites the ' +
          "root's `children` list entirely, swapping in a `Card` subtree with a " +
          "title, body, and action buttons — no `updateDataModel` needed.",
      },
    },
  },
  render: () => <ComponentSwapStory />,
};
