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

// ---- Shared helpers ----

const CATALOG = "https://a2ui.org/specification/v0_9/basic_catalog.json";

/**
 * Builds a mock `Response` whose body is a `ReadableStream` that enqueues one
 * JSONL line per `delay` ms. Shared across all mock stream stories so the
 * stream plumbing is not repeated in each component.
 */
function makeMockResponse(
  messages: object[],
  delay: number,
  signal?: AbortSignal,
): Response {
  const enc = new TextEncoder();
  let idx = 0;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (idx >= messages.length) {
        controller.close();
        return;
      }
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, delay);
        signal?.addEventListener(
          "abort",
          () => { clearTimeout(timer); resolve(); },
          { once: true },
        );
      });
      if (signal?.aborted) { controller.close(); return; }
      controller.enqueue(enc.encode(JSON.stringify(messages[idx++]) + "\n"));
    },
  });
  return new Response(stream, { status: 200 });
}

/**
 * Installs a fetch interceptor for `mockUrl` that returns a mock JSONL stream,
 * and restores the original fetch on cleanup. Returns a cleanup function.
 */
function installMockFetch(
  mockUrl: string,
  messages: object[],
  delay: number,
): () => void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const original = (window as any).fetch as typeof fetch;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fetch = (url: unknown, init?: RequestInit): Promise<Response> => {
    if (String(url) !== mockUrl) return original(url as RequestInfo | URL, init);
    return Promise.resolve(makeMockResponse(messages, delay, init?.signal ?? undefined));
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return () => { (window as any).fetch = original; };
}

// ---- MockStream story ----
// Progressive component build-up + data binding update

const MOCK_STREAM_URL = "mock://a2ui-stream";

const MockStreamStory = component$(() => {
  const ready = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const SID = "demo";

    // Each entry is one JSONL line that arrives 800 ms after the previous one.
    // The UI builds up progressively as messages stream in.
    const messages = [
      // 1. Create the surface (nothing visible yet)
      { version: "v0.9", createSurface: { surfaceId: SID, catalogId: CATALOG } },
      // 2. Heading appears
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: SID,
          components: [
            { component: "Column", id: "root", children: ["heading"] },
            { component: "Text", id: "heading", variant: "h2", text: "Streaming UI" },
          ],
        },
      },
      // 3. Body text appears
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: SID,
          components: [
            { component: "Column", id: "root", children: ["heading", "body"] },
            { component: "Text", id: "body", text: "Each message arrives 800 ms after the previous one." },
          ],
        },
      },
      // 4. Buttons appear
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: SID,
          components: [
            { component: "Column", id: "root", children: ["heading", "body", "row"] },
            { component: "Row", id: "row", children: ["btn1", "btn2"] },
            { component: "Button", id: "btn1", child: "lbl1" },
            { component: "Text", id: "lbl1", text: "Cancel" },
            { component: "Button", id: "btn2", child: "lbl2", primary: true },
            { component: "Text", id: "lbl2", text: "Confirm" },
          ],
        },
      },
      // 5. A TextField bound to /form/name appears; initial value comes from
      //    the data model so the field already shows the pre-filled text.
      { version: "v0.9", updateDataModel: { surfaceId: SID, path: "/form/name", value: "Ada Lovelace" } },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: SID,
          components: [
            { component: "Column", id: "root", children: ["heading", "body", "row", "field"] },
            {
              component: "TextField",
              id: "field",
              label: "Name",
              // Dynamic binding — value is read from /form/name in the DataModel.
              text: { path: "/form/name" },
            },
          ],
        },
      },
      // 6. The server pushes an updated value; the TextField re-renders with
      //    the new value, demonstrating live data binding.
      { version: "v0.9", updateDataModel: { surfaceId: SID, path: "/form/name", value: "Grace Hopper" } },
    ];

    cleanup(installMockFetch(MOCK_STREAM_URL, messages, 800));
    ready.value = true;
  });

  return ready.value ? <ElmA2ui url={MOCK_STREAM_URL} /> : null;
});

export const MockStream: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Intercepts `fetch` for a fake URL and returns a `ReadableStream` " +
          "that enqueues one JSONL message every 800 ms. The UI builds up " +
          "progressively as each message arrives, without any real server. " +
          "Steps 5–6 demonstrate dynamic data binding: a `TextField` is added " +
          "with its `text` prop bound to `/form/name` in the `DataModel`, then " +
          "a subsequent `updateDataModel` message changes the value to show " +
          "that the server can push data updates independently of component structure.",
      },
    },
  },
  render: () => <MockStreamStory />,
};

// ---- StreamingText story ----
// Simulates an AI agent appending tokens to a text output one word at a time.

const STREAMING_TEXT_URL = "mock://a2ui-stream-text";

const StreamingTextStory = component$(() => {
  const ready = useSignal(false);

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

    const messages = [
      { version: "v0.9", createSurface: { surfaceId: SID, catalogId: CATALOG } },
      // Initialise the binding target before the component renders so the
      // Text can resolve { path: "/output" } immediately on mount.
      { version: "v0.9", updateDataModel: { surfaceId: SID, path: "/output", value: "" } },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: SID,
          components: [
            { component: "Column", id: "root", children: ["prompt", "div", "output"] },
            { component: "Text", id: "prompt", variant: "h4", text: "Prompt: What is A2UI streaming?" },
            { component: "Divider", id: "div" },
            // text is a dynamic binding — each updateDataModel below replaces this value.
            { component: "Text", id: "output", text: { path: "/output" } },
          ],
        },
      },
      // Each message appends the next word, simulating token-by-token streaming.
      ...words.map((value) => ({
        version: "v0.9",
        updateDataModel: { surfaceId: SID, path: "/output", value },
      })),
    ];

    cleanup(installMockFetch(STREAMING_TEXT_URL, messages, 400));
    ready.value = true;
  });

  return ready.value ? <ElmA2ui url={STREAMING_TEXT_URL} /> : null;
});

export const StreamingText: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Simulates an AI agent streaming a text response token by token. " +
          "A single `Text` component is bound to `/output` in the `DataModel`; " +
          "the server sends repeated `updateDataModel` messages (every 400 ms) " +
          "that grow the string one word at a time. No component structure " +
          "changes after the initial `updateComponents` — only data changes.",
      },
    },
  },
  render: () => <StreamingTextStory />,
};

// ---- GrowingList story ----
// Search results that stream in one item at a time via updateDataModel.

const GROWING_LIST_URL = "mock://a2ui-stream-list";

const GrowingListStory = component$(() => {
  const ready = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const SID = "growing-list";

    const results = [
      { title: "Introduction to A2UI", desc: "Overview of the agent-driven UI protocol." },
      { title: "Dynamic Data Binding", desc: "How { path } bindings connect components to the DataModel." },
      { title: "Streaming Patterns", desc: "Progressive rendering via JSONL streams." },
      { title: "Component Lifecycle", desc: "createSurface, updateComponents, and deleteSurface." },
    ];

    const messages = [
      { version: "v0.9", createSurface: { surfaceId: SID, catalogId: CATALOG } },
      // Start with an empty array so the List renders immediately (empty).
      { version: "v0.9", updateDataModel: { surfaceId: SID, path: "/results", value: [] } },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: SID,
          components: [
            { component: "Column", id: "root", children: ["heading", "list"] },
            { component: "Text", id: "heading", variant: "h3", text: "Search Results" },
            // List template: one "row" component is rendered per /results element.
            { component: "List", id: "list", children: { componentId: "row", path: "/results" } },
            { component: "Card", id: "row", child: "rowInner" },
            { component: "Column", id: "rowInner", children: ["rowTitle", "rowDesc"] },
            // Relative paths resolve within each item's basePath (e.g. /results/0).
            { component: "Text", id: "rowTitle", variant: "h5", text: { path: "title" } },
            { component: "Text", id: "rowDesc", text: { path: "desc" } },
          ],
        },
      },
      // Stream results in one by one — each updateDataModel grows the array
      // and the List re-renders with one more row.
      ...results.map((_, i) => ({
        version: "v0.9",
        updateDataModel: { surfaceId: SID, path: "/results", value: results.slice(0, i + 1) },
      })),
    ];

    cleanup(installMockFetch(GROWING_LIST_URL, messages, 900));
    ready.value = true;
  });

  return ready.value ? <ElmA2ui url={GROWING_LIST_URL} /> : null;
});

export const GrowingList: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Simulates search results streaming in one item at a time. " +
          "A `List` component uses a template binding (`children.componentId` + `path`) " +
          "so its rows are driven entirely by the `/results` array in the `DataModel`. " +
          "Every 900 ms the server sends an `updateDataModel` that appends one more " +
          "item; the list re-renders without any `updateComponents` message.",
      },
    },
  },
  render: () => <GrowingListStory />,
};

// ---- ComponentSwap story ----
// A loading placeholder is replaced by real content in a single updateComponents.

const COMPONENT_SWAP_URL = "mock://a2ui-stream-swap";

const ComponentSwapStory = component$(() => {
  const ready = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const SID = "swap";

    const messages = [
      { version: "v0.9", createSurface: { surfaceId: SID, catalogId: CATALOG } },
      // 1. Show a loading placeholder immediately.
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: SID,
          components: [
            { component: "Column", id: "root", children: ["loading"] },
            { component: "Text", id: "loading", variant: "caption", text: "Loading…" },
          ],
        },
      },
      // 2. Agent replaces the placeholder with fully-formed content in one shot.
      //    The "loading" component drops out of the root's children list and the
      //    new card subtree takes its place.
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: SID,
          components: [
            { component: "Column", id: "root", children: ["card"] },
            { component: "Card", id: "card", child: "cardInner" },
            { component: "Column", id: "cardInner", children: ["title", "body", "actions"] },
            { component: "Text", id: "title", variant: "h3", text: "Content Loaded" },
            {
              component: "Text",
              id: "body",
              text: "The agent replaced the loading placeholder with real content in a single updateComponents message.",
            },
            { component: "Row", id: "actions", children: ["btnDismiss", "btnView"] },
            { component: "Button", id: "btnDismiss", child: "lblDismiss" },
            { component: "Text", id: "lblDismiss", text: "Dismiss" },
            { component: "Button", id: "btnView", child: "lblView", primary: true },
            { component: "Text", id: "lblView", text: "View Details" },
          ],
        },
      },
    ];

    cleanup(installMockFetch(COMPONENT_SWAP_URL, messages, 1200));
    ready.value = true;
  });

  return ready.value ? <ElmA2ui url={COMPONENT_SWAP_URL} /> : null;
});

export const ComponentSwap: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates how an agent replaces a loading placeholder with real " +
          "content. The first `updateComponents` renders a single caption text " +
          "(`\"Loading…\"`). After 1.2 s the agent sends a second `updateComponents` " +
          "that rewrites the root's `children` list entirely, swapping in a `Card` " +
          "subtree with a title, body, and action buttons — no `updateDataModel` needed.",
      },
    },
  },
  render: () => <ComponentSwapStory />,
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
