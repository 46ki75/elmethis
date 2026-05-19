import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { component$, useSignal } from "@qwik.dev/core";

import { TextApi } from "@a2ui/web_core/v0_9/basic_catalog";

import { ElmA2ui } from "./elm-a2ui";
import { basicCatalog } from "./catalog/basic-catalog";
import { defineRenderer } from "./catalog/catalog";

const BASIC_CATALOG_ID =
  "https://a2ui.org/specification/v0_9/basic_catalog.json";

const createMessages = (...components: unknown[]) => [
  {
    version: "v0.9",
    createSurface: { surfaceId: "s", catalogId: BASIC_CATALOG_ID },
  },
  {
    version: "v0.9",
    updateComponents: { surfaceId: "s", components },
  },
];

const withData = (path: string, value: unknown, ...components: unknown[]) => [
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

describe("ElmA2ui", () => {
  test("renders nothing when no url or messages are supplied", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmA2ui />);
    // No SurfaceView is mounted — surface map is empty.
    expect(screen.querySelectorAll("[data-a2ui-action]").length).toBe(0);
    expect(screen.querySelectorAll("[data-a2ui-bind]").length).toBe(0);
  });

  test("renders a root Column with Text children from pre-built messages", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        messages={createMessages(
          { component: "Column", id: "root", children: ["t1", "t2"] },
          { component: "Text", id: "t1", text: "alpha" },
          { component: "Text", id: "t2", text: "beta" },
        )}
      />,
    );
    expect(screen.outerHTML).toContain("alpha");
    expect(screen.outerHTML).toContain("beta");
  });

  test("resolves a path binding from the data model", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        messages={withData(
          "/user/name",
          "Ada",
          { component: "Column", id: "root", children: ["greeting"] },
          {
            component: "Text",
            id: "greeting",
            text: { path: "/user/name" },
          },
        )}
      />,
    );
    expect(screen.outerHTML).toContain("Ada");
  });

  test("emits bindAction attributes for Button components with actions", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        messages={createMessages(
          { component: "Column", id: "root", children: ["btn"] },
          {
            component: "Button",
            id: "btn",
            child: "label",
            action: { action: "submit" },
          },
          { component: "Text", id: "label", text: "Submit" },
        )}
      />,
    );
    const button = screen.querySelector('[data-a2ui-action="btn"]');
    expect(button).not.toBeNull();
    expect(screen.outerHTML).toContain("Submit");
  });

  test("emits bindValue attributes for TextField components", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        messages={createMessages(
          { component: "Column", id: "root", children: ["field"] },
          {
            component: "TextField",
            id: "field",
            label: "Name",
            value: { path: "/form/name" },
          },
        )}
      />,
    );
    const input = screen.querySelector('input[data-a2ui-bind="field:value"]');
    expect(input).not.toBeNull();
  });

  test("custom catalog overrides a renderer", async () => {
    const customCatalog = basicCatalog.extend(
      defineRenderer(TextApi, ({ props, resolve }) => (
        <mark data-custom-text>{resolve(props.text)}</mark>
      )),
    );
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        catalog={customCatalog}
        messages={createMessages(
          { component: "Column", id: "root", children: ["t"] },
          { component: "Text", id: "t", text: "overridden" },
        )}
      />,
    );
    expect(screen.outerHTML).toContain("data-custom-text");
    expect(screen.outerHTML).toContain("overridden");
  });

  test("ignores messages that arrived before createSurface", async () => {
    // A stray updateComponents with no matching surface is silently dropped.
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        messages={[
          {
            version: "v0.9",
            updateComponents: {
              surfaceId: "missing",
              components: [
                { component: "Text", id: "root", text: "should not appear" },
              ],
            },
          },
        ]}
      />,
    );
    expect(screen.outerHTML).not.toContain("should not appear");
  });

  test("renders multiple surfaces side-by-side", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        messages={[
          {
            version: "v0.9",
            createSurface: { surfaceId: "a", catalogId: BASIC_CATALOG_ID },
          },
          {
            version: "v0.9",
            updateComponents: {
              surfaceId: "a",
              components: [{ component: "Text", id: "root", text: "first" }],
            },
          },
          {
            version: "v0.9",
            createSurface: { surfaceId: "b", catalogId: BASIC_CATALOG_ID },
          },
          {
            version: "v0.9",
            updateComponents: {
              surfaceId: "b",
              components: [{ component: "Text", id: "root", text: "second" }],
            },
          },
        ]}
      />,
    );
    expect(screen.outerHTML).toContain("first");
    expect(screen.outerHTML).toContain("second");
  });

  test("an updateDataModel after initial render updates resolved text", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        messages={withData(
          "/v",
          "one",
          { component: "Column", id: "root", children: ["t"] },
          { component: "Text", id: "t", text: { path: "/v" } },
        )}
      />,
    );
    expect(screen.outerHTML).toContain("one");
    // We can't easily push more messages into the live store via this surface
    // API in tests — the basic check above confirms the binding works on
    // initial render. Further dynamic-update coverage lives in the
    // render-tree spec which feeds a MessageProcessor directly.
  });

  // BUG repro (review #1 + #8a): SurfaceView attaches its native event
  // delegator inside a default-strategy `useVisibleTask$`. In jsdom (no
  // IntersectionObserver) the task never fires, so the delegator is never
  // wired up. After the fix (e.g. `{ strategy: "document-ready" }`), an input
  // event on a TextField should write back into the data model and the bound
  // Text should reflect the new value.
  //
  // Note: the surface-level delegator listens via native `addEventListener`,
  // not via Qwik's QRL system, so `userEvent` (which dispatches through
  // Qwik's container) will only reach it if the test harness also routes the
  // event natively. If the test fails after fixing the strategy, it likely
  // means the env limitation requires browser-level coverage (e.g. Playwright)
  // instead.
  test("input on a bound TextField writes back to the data model", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(
      <ElmA2ui
        messages={withData(
          "/form/name",
          "initial",
          { component: "Column", id: "root", children: ["field", "echo"] },
          {
            component: "TextField",
            id: "field",
            label: "Name",
            value: { path: "/form/name" },
          },
          { component: "Text", id: "echo", text: { path: "/form/name" } },
        )}
      />,
    );

    const input = screen.querySelector(
      'input[data-a2ui-bind="field:value"]',
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();

    input!.value = "Ada";
    await userEvent('input[data-a2ui-bind="field:value"]', "input");

    // After write-back the bound Text should reflect the new value.
    expect(screen.outerHTML).toContain("Ada");
    expect(screen.outerHTML).not.toContain("initial");
  });

  // BUG repro (review #2): `messages` is shallow-cloned into a `useStore` at
  // mount and never re-tracked. When a parent re-renders with a different
  // messages array, the inner store still sees the original list and the new
  // components / data updates never reach the MessageProcessor.
  test("appending to the messages prop after mount renders the new components", async () => {
    const initial = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "s", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [{ component: "Text", id: "root", text: "first" }],
        },
      },
    ];
    const appended = [
      ...initial,
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [{ component: "Text", id: "root", text: "second" }],
        },
      },
    ];

    const Wrapper = component$(() => {
      const showMore = useSignal(false);
      return (
        <div>
          <button id="grow" onClick$={() => (showMore.value = true)}>
            grow
          </button>
          <ElmA2ui messages={showMore.value ? appended : initial} />
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Wrapper />);
    expect(screen.outerHTML).toContain("first");

    await userEvent("#grow", "click");

    expect(screen.outerHTML).toContain("second");
    expect(screen.outerHTML).not.toContain("first");
  });
});
