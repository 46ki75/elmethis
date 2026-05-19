import { describe, expect, test } from "vitest";
import { z } from "zod";
import { createDOM } from "@qwik.dev/core/testing";

import {
  Catalog,
  MessageProcessor,
  type ComponentApi,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";

import { CatalogRenderer, defineRenderer } from "./catalog/catalog";
import { renderSurface, ROOT_COMPONENT_ID } from "./render-tree";

const CATALOG_ID = "https://elmethis.test/render-tree-spec.json";

// ---- Tiny test catalog (so we don't depend on the basic catalog here) ------

const BoxApi = {
  name: "Box",
  schema: z.object({ children: z.array(z.string()).optional() }).strict(),
} as const satisfies ComponentApi;

const TextApi = {
  name: "Text",
  schema: z.object({ text: z.string() }).strict(),
} as const satisfies ComponentApi;

const SelfRefApi = {
  name: "SelfRef",
  schema: z.object({ child: z.string().optional() }).strict(),
} as const satisfies ComponentApi;

const TEST_COMPONENTS: ComponentApi[] = [BoxApi, TextApi, SelfRefApi];

const renderCatalog = new CatalogRenderer([
  // Default Box renderer ignores children — the test below overrides it with
  // a children-aware version when needed.
  defineRenderer(BoxApi, () => <div data-kind="box" />),
  defineRenderer(TextApi, ({ props }) => (
    <span data-kind="text">{String(props.text)}</span>
  )),
  defineRenderer(SelfRefApi, ({ props, renderChild }) => (
    <section data-kind="self-ref">
      {props.child ? renderChild(props.child) : null}
    </section>
  )),
]);

// Override Box with a children-aware version (lets us assert traversal).
const traversalCatalog = renderCatalog.extend(
  defineRenderer(BoxApi, ({ props, childRefs, renderChild }) => (
    <div data-kind="box">
      {childRefs(props.children).map(({ id, path }, i) => (
        <span key={`${id}:${i}`}>{renderChild(id, path, i)}</span>
      ))}
    </div>
  )),
);

function buildSurface(components: object[]): SurfaceModel<ComponentApi> {
  const catalog = new Catalog(CATALOG_ID, TEST_COMPONENTS);
  const processor = new MessageProcessor<ComponentApi>([catalog]);
  let captured: SurfaceModel<ComponentApi> | null = null;
  processor.model.onSurfaceCreated.subscribe((s) => {
    captured = s;
  });
  processor.processMessages([
    {
      version: "v0.9",
      createSurface: { surfaceId: "s", catalogId: CATALOG_ID },
    },
    { version: "v0.9", updateComponents: { surfaceId: "s", components } },
  ] as never[]);
  if (!captured) throw new Error("surface not created");
  return captured;
}

async function htmlOf(surface: SurfaceModel<ComponentApi>, catalog = traversalCatalog) {
  const out = renderSurface(surface, catalog);
  const dom = await createDOM();
  await dom.render(<div>{out}</div>);
  return dom.screen.outerHTML;
}

describe("renderSurface", () => {
  test("exports the spec's root id constant", () => {
    expect(ROOT_COMPONENT_ID).toBe("root");
  });

  test("returns null when no root component is present", () => {
    const surface = buildSurface([
      { component: "Text", id: "notroot", text: "hello" },
    ]);
    expect(renderSurface(surface, traversalCatalog)).toBeNull();
  });

  test("returns null when the catalog has no renderer for root's type", () => {
    const surface = buildSurface([
      { component: "Box", id: "root", children: [] },
    ]);
    // Renderer catalog with only Text — Box's render is missing.
    const onlyText = new CatalogRenderer([
      defineRenderer(TextApi, () => null),
    ]);
    expect(renderSurface(surface, onlyText)).toBeNull();
  });

  test("renders the root and traverses children", async () => {
    const surface = buildSurface([
      { component: "Box", id: "root", children: ["t1", "t2"] },
      { component: "Text", id: "t1", text: "alpha" },
      { component: "Text", id: "t2", text: "beta" },
    ]);
    const html = await htmlOf(surface);
    expect(html).toContain("alpha");
    expect(html).toContain("beta");
    expect(html).toContain('data-kind="box"');
  });

  test("tolerates a self-referential component without infinite recursion", async () => {
    const surface = buildSurface([
      { component: "SelfRef", id: "root", child: "root" },
    ]);
    // Root renders once; its child pointing back to root short-circuits to null.
    const html = await htmlOf(surface);
    expect(html).toContain('data-kind="self-ref"');
  });

  test("tolerates an A→B→A cycle by stopping at the repeat", async () => {
    const surface = buildSurface([
      { component: "SelfRef", id: "root", child: "b" },
      { component: "SelfRef", id: "b", child: "root" },
    ]);
    const html = await htmlOf(surface);
    // We render root and one descendant. The B → root reference is skipped.
    const occurrences = (html.match(/data-kind="self-ref"/g) ?? []).length;
    expect(occurrences).toBeGreaterThanOrEqual(2);
  });

  test("expands a list template into one child per data-model row", async () => {
    const catalog = new Catalog(CATALOG_ID, TEST_COMPONENTS);
    const processor = new MessageProcessor<ComponentApi>([catalog]);
    let captured: SurfaceModel<ComponentApi> | null = null;
    processor.model.onSurfaceCreated.subscribe((s) => {
      captured = s;
    });
    processor.processMessages([
      {
        version: "v0.9",
        createSurface: { surfaceId: "s", catalogId: CATALOG_ID },
      },
      {
        version: "v0.9",
        updateDataModel: { surfaceId: "s", path: "/items", value: [1, 2, 3] },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [
            {
              component: "Box",
              id: "root",
              children: { componentId: "item", path: "/items" },
            },
            { component: "Text", id: "item", text: "tick" },
          ],
        },
      },
    ] as never[]);
    const surface = captured as SurfaceModel<ComponentApi> | null;
    if (!surface) throw new Error("surface not created");
    const html = await htmlOf(surface);
    // Three "tick" entries — one per row.
    const occurrences = (html.match(/tick/g) ?? []).length;
    expect(occurrences).toBe(3);
  });
});
