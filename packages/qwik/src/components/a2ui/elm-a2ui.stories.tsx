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

// ---- Streaming mock story ----

const MOCK_STREAM_URL = "mock://a2ui-stream";

/**
 * Intercepts `window.fetch` for `MOCK_STREAM_URL` and returns a
 * `ReadableStream` that enqueues one JSONL line every 800 ms, simulating a
 * real server-sent JSONL stream without any network dependency.
 */
const MockStreamStory = component$(() => {
  const ready = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const CATALOG =
      "https://a2ui.org/specification/v0_9/basic_catalog.json";
    const SID = "demo";
    const DELAY = 800;

    // Each entry is one JSONL line that arrives after DELAY ms.
    // The UI builds up progressively as messages stream in.
    const messages = [
      // 1. Create the surface (nothing visible yet)
      {
        version: "v0.9",
        createSurface: { surfaceId: SID, catalogId: CATALOG },
      },
      // 2. Heading appears
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
      // 3. Body text appears
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: SID,
          components: [
            { component: "Column", id: "root", children: ["heading", "body"] },
            {
              component: "Text",
              id: "body",
              text: "Each message arrives 800 ms after the previous one.",
            },
          ],
        },
      },
      // 4. Buttons appear
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
            { component: "Button", id: "btn2", child: "lbl2", primary: true },
            { component: "Text", id: "lbl2", text: "Confirm" },
          ],
        },
      },
      // 5. A TextField bound to /form/name appears; initial value comes from
      //    the data model so the label already shows the placeholder text.
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
              // Dynamic binding — value is read from /form/name in the DataModel.
              text: { path: "/form/name" },
            },
          ],
        },
      },
      // 6. The server pushes an updated value into the DataModel; the TextField
      //    re-renders with the new value, demonstrating live data binding.
      {
        version: "v0.9",
        updateDataModel: {
          surfaceId: SID,
          path: "/form/name",
          value: "Grace Hopper",
        },
      },
    ];

    const enc = new TextEncoder();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const original = (window as any).fetch as typeof fetch;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fetch = (
      url: unknown,
      init?: RequestInit,
    ): Promise<Response> => {
      if (String(url) !== MOCK_STREAM_URL) {
        return original(url as RequestInfo | URL, init);
      }

      const signal = init?.signal;
      let idx = 0;

      const stream = new ReadableStream<Uint8Array>({
        async pull(controller) {
          // All messages delivered — close the stream
          if (idx >= messages.length) {
            controller.close();
            return;
          }

          // Wait DELAY ms (or bail early on abort)
          await new Promise<void>((resolve) => {
            const timer = setTimeout(resolve, DELAY);
            signal?.addEventListener(
              "abort",
              () => {
                clearTimeout(timer);
                resolve();
              },
              { once: true },
            );
          });

          if (signal?.aborted) {
            controller.close();
            return;
          }

          controller.enqueue(
            enc.encode(JSON.stringify(messages[idx++]) + "\n"),
          );
        },
      });

      return Promise.resolve(new Response(stream, { status: 200 }));
    };

    ready.value = true;

    cleanup(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fetch = original;
    });
  });

  return ready.value ? (
    <>
      <ElmA2ui url={MOCK_STREAM_URL} />
    </>
  ) : null;
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
