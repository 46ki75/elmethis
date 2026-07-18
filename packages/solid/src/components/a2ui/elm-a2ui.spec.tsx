import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  GenericBinder,
  SurfaceGroupModel,
  SurfaceModel,
} from "@a2ui/web_core/v0_9";
import { TextApi } from "@a2ui/web_core/v0_9/basic_catalog";
import { NOTION_BLOCK_CATALOG_ID } from "@elmethis/core";

import { basicCatalog } from "./catalog/basic-catalog";
import { defineRenderer } from "./catalog/catalog";
import { BASIC_CATALOG_ID, ElmA2ui } from "./elm-a2ui";

const createMessages = (
  ...components: Array<Record<string, unknown>>
): object[] => [
  {
    version: "v0.9",
    createSurface: { surfaceId: "s", catalogId: BASIC_CATALOG_ID },
  },
  {
    version: "v0.9",
    updateComponents: { surfaceId: "s", components },
  },
];

const withData = (
  path: string,
  value: unknown,
  ...components: Array<Record<string, unknown>>
): object[] => [
  {
    version: "v0.9",
    createSurface: { surfaceId: "s", catalogId: BASIC_CATALOG_ID },
  },
  { version: "v0.9", updateDataModel: { surfaceId: "s", path, value } },
  {
    version: "v0.9",
    updateComponents: { surfaceId: "s", components },
  },
];

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("[CSR] ElmA2ui", () => {
  it("defaults to Notion renderers and accepts both Notion and basic catalog ids", () => {
    const messages = [
      {
        version: "v0.9",
        createSurface: {
          surfaceId: "notion",
          catalogId: NOTION_BLOCK_CATALOG_ID,
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "notion",
          components: [
            { component: "Paragraph", id: "root", children: ["rich"] },
            { component: "RichText", id: "rich", text: "notion" },
          ],
        },
      },
      {
        version: "v0.9",
        createSurface: { surfaceId: "basic", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "basic",
          components: [{ component: "Text", id: "root", text: "basic" }],
        },
      },
    ];
    const rendered = render(() => <ElmA2ui messages={messages} />);
    expect(rendered.container).toHaveTextContent("notion");
    expect(rendered.container).toHaveTextContent("basic");
  });

  it("keeps destructured custom renderer props reactive", () => {
    const catalog = basicCatalog.extend(
      // Public render callbacks may destructure their stable store-backed props.
      // eslint-disable-next-line solid/no-destructure
      defineRenderer(TextApi, ({ props }) => (
        <strong data-custom-renderer>{props.text}</strong>
      )),
    );
    const initial = withData("/text", "custom", {
      component: "Text",
      id: "root",
      text: { path: "/text" },
    });
    const [messages, setMessages] = createSignal(initial);
    const rendered = render(() => (
      <ElmA2ui catalog={catalog} messages={messages()} />
    ));
    const custom = rendered.container.querySelector(
      "strong[data-custom-renderer]",
    );
    expect(custom).toHaveTextContent("custom");

    setMessages([
      ...initial,
      {
        version: "v0.9",
        updateDataModel: { surfaceId: "s", path: "/text", value: "updated" },
      },
    ]);
    expect(custom).toHaveTextContent("updated");
    expect(
      rendered.container.querySelector("strong[data-custom-renderer]"),
    ).toBe(custom);
  });

  it("binds values, writes them back once, and deep-resolves actions", async () => {
    const setSpy = vi.spyOn(
      (await import("@a2ui/web_core/v0_9")).DataContext.prototype,
      "set",
    );
    const actionSpy = vi.spyOn(SurfaceModel.prototype, "dispatchAction");
    const messages = [
      ...withData(
        "/form/name",
        "initial",
        { component: "Column", id: "root", children: ["field", "echo", "go"] },
        {
          component: "TextField",
          id: "field",
          label: "Name",
          value: { path: "/form/name" },
        },
        { component: "Text", id: "echo", text: { path: "/form/name" } },
        {
          component: "Button",
          id: "go",
          child: "label",
          action: {
            event: {
              name: "submit",
              context: { nested: { name: { path: "/form/name" } } },
            },
          },
        },
        { component: "Text", id: "label", text: "Go" },
      ),
    ];
    const rendered = render(() => <ElmA2ui messages={messages} />);
    const input = rendered.container.querySelector(
      '[data-a2ui-component-id="field"] input',
    ) as HTMLInputElement;
    input.focus();
    setSpy.mockClear();
    fireEvent.input(input, { target: { value: "Ada" } });
    expect(setSpy).toHaveBeenCalledOnce();
    expect(rendered.container).toHaveTextContent("Ada");
    expect(
      rendered.container.querySelector(
        '[data-a2ui-component-id="field"] input',
      ),
    ).toBe(input);
    expect(document.activeElement).toBe(input);

    fireEvent.click(rendered.getByRole("button", { name: "Go" }));
    expect(actionSpy).toHaveBeenCalledWith(
      {
        event: { name: "submit", context: { nested: { name: "Ada" } } },
      },
      "go",
    );
  });

  it("reactively enforces checks and exposes validation errors", () => {
    const actionSpy = vi.spyOn(SurfaceModel.prototype, "dispatchAction");
    const requiredCheck = {
      condition: {
        call: "required",
        args: { value: { path: "/name" } },
      },
      message: "Name is required",
    };
    const rendered = render(() => (
      <ElmA2ui
        messages={withData(
          "/name",
          "",
          { component: "Column", id: "root", children: ["field", "go"] },
          {
            component: "TextField",
            id: "field",
            label: "Name",
            value: { path: "/name" },
            checks: [requiredCheck],
          },
          {
            component: "Button",
            id: "go",
            child: "label",
            action: { event: { name: "submit" } },
            checks: [requiredCheck],
          },
          { component: "Text", id: "label", text: "Submit" },
        )}
      />
    ));
    const button = rendered.getByRole("button", { name: "Submit" });
    const input = rendered.getByRole("textbox", { name: "Name" });

    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(rendered.getAllByText("Name is required")).toHaveLength(2);
    fireEvent.click(button);
    expect(actionSpy).not.toHaveBeenCalled();

    fireEvent.input(input, { target: { value: "Ada" } });
    expect(button).toHaveAttribute("aria-disabled", "false");
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(rendered.queryByText("Name is required")).toBeNull();
    fireEvent.click(button);
    expect(actionSpy).toHaveBeenCalledWith({ event: { name: "submit" } }, "go");
  });

  it("opens modal content lazily and closes through the native dialog", () => {
    const rendered = render(() => (
      <ElmA2ui
        messages={createMessages(
          {
            component: "Modal",
            id: "root",
            trigger: "trigger",
            content: "content",
          },
          { component: "Text", id: "trigger", text: "Open details" },
          { component: "Text", id: "content", text: "Secret details" },
        )}
      />
    ));

    expect(rendered.queryByText("Secret details")).toBeNull();
    fireEvent.click(rendered.getByRole("button", { name: "Open details" }));
    expect(rendered.getByText("Secret details")).toBeInTheDocument();

    const dialog = rendered.container.querySelector("dialog")!;
    dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
    expect(rendered.queryByText("Secret details")).toBeNull();
  });

  it("processes append tails, swaps streams, deletes surfaces, and disposes old models", () => {
    const disposeSpy = vi.spyOn(SurfaceGroupModel.prototype, "dispose");
    const initial = createMessages(
      { component: "Column", id: "root", children: ["a"] },
      { component: "Text", id: "a", text: "alpha" },
    );
    const appended = [
      ...initial,
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [
            { component: "Column", id: "root", children: ["a", "b"] },
            { component: "Text", id: "b", text: "beta" },
          ],
        },
      },
    ];
    const replacement = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "other", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "other",
          components: [{ component: "Text", id: "root", text: "replacement" }],
        },
      },
    ];
    const deleted = [
      ...replacement,
      { version: "v0.9", deleteSurface: { surfaceId: "other" } },
    ];
    const [messages, setMessages] = createSignal(initial);
    const rendered = render(() => <ElmA2ui messages={messages()} />);
    expect(rendered.container).toHaveTextContent("alpha");
    disposeSpy.mockClear();

    setMessages(appended);
    expect(rendered.container).toHaveTextContent("alpha");
    expect(rendered.container).toHaveTextContent("beta");
    expect(disposeSpy).not.toHaveBeenCalled();

    setMessages(replacement);
    expect(rendered.container).toHaveTextContent("replacement");
    expect(rendered.container).not.toHaveTextContent("alpha");
    expect(disposeSpy).toHaveBeenCalledOnce();

    setMessages(deleted);
    expect(rendered.container).not.toHaveTextContent("replacement");

    rendered.unmount();
    expect(disposeSpy).toHaveBeenCalledTimes(2);
  });

  it("releases GenericBinder ownership when a child leaves the tree", () => {
    const disposeSpy = vi.spyOn(GenericBinder.prototype, "dispose");
    const initial = createMessages(
      { component: "Column", id: "root", children: ["a", "b"] },
      { component: "Text", id: "a", text: "alpha" },
      { component: "Text", id: "b", text: "beta" },
    );
    const dropped = [
      ...initial,
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [{ component: "Column", id: "root", children: ["a"] }],
        },
      },
    ];
    const [messages, setMessages] = createSignal(initial);
    const rendered = render(() => <ElmA2ui messages={messages()} />);
    disposeSpy.mockClear();
    setMessages(dropped);
    expect(rendered.container).not.toHaveTextContent("beta");
    expect(disposeSpy).toHaveBeenCalled();
  });

  it("handles missing children, cycles, unknown types, and type replacement", () => {
    const initial = createMessages({
      component: "Card",
      id: "root",
      child: "ghost",
    });
    const typed = [
      ...initial,
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [
            { component: "Column", id: "root", children: ["mystery", "cycle"] },
            { component: "Mystery", id: "mystery" },
            { component: "Column", id: "cycle", children: ["cycle"] },
          ],
        },
      },
    ];
    const replaced = [
      ...typed,
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [
            { component: "CheckBox", id: "root", label: "Ready", value: true },
          ],
        },
      },
    ];
    const [messages, setMessages] = createSignal(initial);
    const rendered = render(() => <ElmA2ui messages={messages()} />);
    expect(rendered.container).toHaveTextContent("[Loading ghost…]");
    setMessages(typed);
    expect(rendered.container).toHaveTextContent("Unknown component: Mystery");
    expect(
      rendered.container.querySelectorAll('[data-a2ui-component-id="cycle"]'),
    ).toHaveLength(1);
    setMessages(replaced);
    expect(rendered.getByRole("checkbox", { name: "Ready" })).toBeChecked();
    expect(rendered.container).not.toHaveTextContent("Loading");
  });

  it("keeps template instances scoped and passes sibling indexes to table cells", () => {
    const messages = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "list", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateDataModel: {
          surfaceId: "list",
          path: "/items",
          value: [{ label: "first" }, { label: "second" }],
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "list",
          components: [
            {
              component: "Row",
              id: "root",
              children: { componentId: "item", path: "/items" },
            },
            { component: "Text", id: "item", text: { path: "label" } },
          ],
        },
      },
      {
        version: "v0.9",
        createSurface: {
          surfaceId: "table",
          catalogId: NOTION_BLOCK_CATALOG_ID,
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "table",
          components: [
            {
              component: "Table",
              id: "root",
              body: ["row"],
              hasColumnHeader: true,
            },
            { component: "TableRow", id: "row", children: ["a", "b"] },
            { component: "TableCell", id: "a", children: ["at"] },
            { component: "RichText", id: "at", text: "row header" },
            { component: "TableCell", id: "b", children: ["bt"] },
            { component: "RichText", id: "bt", text: "value" },
          ],
        },
      },
    ];
    const rendered = render(() => <ElmA2ui messages={messages} />);
    expect(rendered.container).toHaveTextContent("first");
    expect(rendered.container).toHaveTextContent("second");
    expect(
      rendered.container.querySelector(
        '[data-a2ui-component-key="item@/items/0"]',
      ),
    ).not.toBeNull();
    expect(
      rendered.container.querySelector(
        '[data-a2ui-component-key="item@/items/1"]',
      ),
    ).not.toBeNull();
    expect(
      rendered.container.querySelector("tbody th[scope=row]"),
    ).toHaveTextContent("row header");
    expect(rendered.container.querySelector("tbody td")).toHaveTextContent(
      "value",
    );
  });

  it("scopes repeated control ids and radio groups by data path", () => {
    const messages = withData(
      "/items",
      [
        { name: "first", selected: [] },
        { name: "second", selected: [] },
      ],
      {
        component: "Column",
        id: "root",
        children: { componentId: "item", path: "/items" },
      },
      { component: "Column", id: "item", children: ["field", "picker"] },
      {
        component: "TextField",
        id: "field",
        label: "Name",
        value: { path: "name" },
      },
      {
        component: "ChoicePicker",
        id: "picker",
        label: "Choice",
        value: { path: "selected" },
        options: [
          { label: "A", value: "a" },
          { label: "B", value: "b" },
        ],
      },
    );
    const rendered = render(() => <ElmA2ui messages={messages} />);
    const textInputs = [
      ...rendered.container.querySelectorAll<HTMLInputElement>(
        'input[type="text"]',
      ),
    ];
    const radioNames = [
      ...rendered.container.querySelectorAll<HTMLInputElement>(
        'input[type="radio"]',
      ),
    ].map((input) => input.name);

    expect(textInputs).toHaveLength(2);
    expect(new Set(textInputs.map((input) => input.id)).size).toBe(2);
    expect(
      textInputs.every(
        (input) =>
          rendered.container.querySelector(`label[for="${input.id}"]`) != null,
      ),
    ).toBe(true);
    expect(new Set(radioNames).size).toBe(2);
  });

  it("keeps control identities unique across ambiguous surface tuples", () => {
    const messages = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "a-b", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "a-b",
          components: [
            { component: "Column", id: "root", children: ["c"] },
            { component: "TextField", id: "c", label: "First" },
          ],
        },
      },
      {
        version: "v0.9",
        createSurface: { surfaceId: "a", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "a",
          components: [
            { component: "Column", id: "root", children: ["b-c"] },
            { component: "TextField", id: "b-c", label: "Second" },
          ],
        },
      },
    ];
    const rendered = render(() => <ElmA2ui messages={messages} />);
    const ids = [
      ...rendered.container.querySelectorAll<HTMLInputElement>(
        'input[type="text"]',
      ),
    ].map((input) => input.id);

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it("binds ContentTabs label and content templates", () => {
    const messages = [
      {
        version: "v0.9",
        createSurface: {
          surfaceId: "tabs",
          catalogId: NOTION_BLOCK_CATALOG_ID,
        },
      },
      {
        version: "v0.9",
        updateDataModel: {
          surfaceId: "tabs",
          path: "/tabs",
          value: [{ label: "Overview", content: "Template content" }],
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "tabs",
          components: [
            { component: "ContentTabs", id: "root", children: ["tab"] },
            {
              component: "ContentTab",
              id: "tab",
              label: { componentId: "label", path: "/tabs" },
              content: { componentId: "content", path: "/tabs" },
            },
            { component: "RichText", id: "label", text: { path: "label" } },
            { component: "Paragraph", id: "content", children: ["body"] },
            { component: "RichText", id: "body", text: { path: "content" } },
          ],
        },
      },
    ];
    const rendered = render(() => <ElmA2ui messages={messages} />);
    expect(rendered.container).toHaveTextContent("Overview");
    expect(rendered.container).toHaveTextContent("Template content");
  });

  it("continues after invalid messages and rebuilds when catalogId changes", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const valid = createMessages({
      component: "Text",
      id: "root",
      text: "valid",
    });
    const first = [
      {
        version: "v0.9",
        updateComponents: { surfaceId: "missing", components: [] },
      },
      ...valid,
    ];
    const [catalogId, setCatalogId] = createSignal("catalog-a");
    const rendered = render(() => (
      <ElmA2ui messages={first} catalogId={catalogId()} />
    ));
    expect(rendered.container).toHaveTextContent("valid");
    setCatalogId("catalog-b");
    expect(rendered.container).toHaveTextContent("valid");
  });

  it("gives messages precedence over URL and aborts a reactive URL request", async () => {
    const requests: AbortSignal[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init?: RequestInit) => {
        requests.push(init?.signal as AbortSignal);
        return new Promise<Response>(() => undefined);
      }),
    );
    const [url, setUrl] = createSignal("/one.jsonl");
    const [messages, setMessages] = createSignal<object[] | undefined>();
    const rendered = render(() => (
      <ElmA2ui url={url()} messages={messages()} />
    ));
    expect(requests).toHaveLength(1);
    setUrl("/two.jsonl");
    expect(requests[0]?.aborted).toBe(true);
    expect(requests).toHaveLength(2);
    setMessages(
      createMessages({ component: "Text", id: "root", text: "controlled" }),
    );
    await waitFor(() =>
      expect(rendered.container).toHaveTextContent("controlled"),
    );
    expect(requests[1]?.aborted).toBe(true);
  });

  it("streams a chunked JSONL response and continues after a malformed line", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            `${JSON.stringify(createMessages()[0])}\ninvalid\n${JSON.stringify(
              createMessages({
                component: "Text",
                id: "root",
                text: "streamed",
              })[1],
            ).slice(0, 24)}`,
          ),
        );
        controller.enqueue(
          encoder.encode(
            `${JSON.stringify(
              createMessages({
                component: "Text",
                id: "root",
                text: "streamed",
              })[1],
            ).slice(24)}\n`,
          ),
        );
        controller.close();
      },
    });
    const fetchMock = vi.fn(() =>
      Promise.resolve(new Response(body, { status: 200 })),
    );
    vi.stubGlobal("fetch", fetchMock);
    const headers = { Authorization: "Bearer test" };
    const rendered = render(() => (
      <ElmA2ui url="/surface.jsonl" headers={headers} />
    ));

    await waitFor(() =>
      expect(rendered.container).toHaveTextContent("streamed"),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/surface.jsonl",
      expect.objectContaining({ headers, signal: expect.any(AbortSignal) }),
    );
    expect(console.warn).toHaveBeenCalledWith(
      "[ElmA2ui] skipped invalid JSON line:",
      "invalid",
      expect.anything(),
    );
  });
});
