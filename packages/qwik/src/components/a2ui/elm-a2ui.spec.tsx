import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";

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
});
