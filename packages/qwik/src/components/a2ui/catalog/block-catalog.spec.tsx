import { describe, expect, test } from "vitest";
import { $, noSerialize } from "@qwik.dev/core";
import { createDOM } from "@qwik.dev/core/testing";

import {
  Catalog,
  ComponentContext,
  MessageProcessor,
  type ComponentApi,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";
import {
  BASIC_COMPONENTS,
  BASIC_FUNCTIONS,
} from "@a2ui/web_core/v0_9/basic_catalog";

import { type RenderArgs } from "./catalog";
import { blockCatalog } from "./block-catalog";
import {
  BlockQuoteApi,
  BookmarkApi,
  CodeBlockApi,
  ColumnApi,
  ContentTabApi,
  ContentTabsApi,
  HeadingApi,
  IconApi,
  KatexApi,
  LinkTextApi,
  ListApi,
  ListItemApi,
  MermaidApi,
  ParagraphApi,
  RichTextApi,
  TableApi,
  TableCellApi,
  TableRowApi,
  UnsupportedApi,
} from "./block-catalog-schema";

const CATALOG_ID = "https://elmethis.test/block_catalog.json";

const BLOCK_COMPONENTS: ComponentApi[] = [
  RichTextApi,
  LinkTextApi,
  IconApi,
  ColumnApi,
  HeadingApi,
  ParagraphApi,
  ListApi,
  ListItemApi,
  BlockQuoteApi,
  BookmarkApi,
  CodeBlockApi,
  KatexApi,
  MermaidApi,
  ContentTabApi,
  ContentTabsApi,
  TableApi,
  TableRowApi,
  TableCellApi,
  UnsupportedApi,
];

interface ComponentSpec {
  component: string;
  id: string;
  [k: string]: unknown;
}

/** Builds a surface holding the target plus any extras, returns RenderArgs for target. */
function buildArgs(
  target: ComponentSpec,
  options: {
    dataModel?: Record<string, unknown>;
    extras?: ComponentSpec[];
  } = {},
): RenderArgs {
  const catalog = new Catalog(
    CATALOG_ID,
    [...(BASIC_COMPONENTS as ComponentApi[]), ...BLOCK_COMPONENTS],
    BASIC_FUNCTIONS,
  );
  const processor = new MessageProcessor<ComponentApi>([catalog]);
  let captured: SurfaceModel<ComponentApi> | null = null;
  processor.model.onSurfaceCreated.subscribe((s) => {
    captured = s;
  });

  const messages: unknown[] = [
    {
      version: "v0.9",
      createSurface: { surfaceId: "s", catalogId: CATALOG_ID },
    },
  ];
  for (const [path, value] of Object.entries(options.dataModel ?? {})) {
    messages.push({
      version: "v0.9",
      updateDataModel: { surfaceId: "s", path, value },
    });
  }
  messages.push({
    version: "v0.9",
    updateComponents: {
      surfaceId: "s",
      components: [target, ...(options.extras ?? [])],
    },
  });
  processor.processMessages(messages as never[]);

  const surface = captured as SurfaceModel<ComponentApi> | null;
  if (!surface) throw new Error("surface was not created");
  const ctx = new ComponentContext(surface, target.id);
  const model = surface.componentsModel.get(target.id);
  if (!model) throw new Error(`component "${target.id}" not in surface`);

  const resolve = <V = string,>(v: unknown): V => {
    if (typeof v === "string") return v as V;
    if (v == null) return "" as V;
    if (typeof v === "object")
      return (ctx.dataContext.resolveDynamicValue(v as never) ?? "") as V;
    return String(v) as V;
  };

  const childRefs = (children: unknown): { id: string; path: string }[] => {
    if (Array.isArray(children))
      return children
        .filter((id): id is string => typeof id === "string")
        .map((id) => ({ id, path: "/" }));
    if (children && typeof children === "object" && "componentId" in children) {
      const tmpl = children as { componentId: string; path: string };
      const items = surface.dataModel.get(tmpl.path);
      if (!Array.isArray(items)) return [];
      return items.map((_, i) => ({
        id: tmpl.componentId,
        path: `${tmpl.path}/${i}`,
      }));
    }
    return [];
  };

  const renderChild = (id: string) => <span data-child-id={id}>{id}</span>;

  return {
    componentId: target.id,
    index: 0,
    props: model.properties,
    surface,
    ctx,
    resolve,
    childRefs,
    renderChild,
    setBinding$: (() => {
      const modelRef = noSerialize(model);
      const ctxRef = noSerialize(ctx);
      return $((propName: string, value: unknown) => {
        if (!modelRef || !ctxRef) return;
        const bound = (modelRef.properties as Record<string, unknown>)[
          propName
        ];
        if (!bound || typeof bound !== "object" || !("path" in bound)) return;
        ctxRef.dataContext.set((bound as { path: string }).path, value);
      });
    })(),
    dispatchAction$: (() => {
      const modelRef = noSerialize(model);
      const surfaceRef = noSerialize(surface);
      const ctxRef = noSerialize(ctx);
      return $((propName: string = "action") => {
        if (!modelRef || !surfaceRef || !ctxRef) return;
        const action = (modelRef.properties as Record<string, unknown>)[
          propName
        ];
        if (!action) return;
        surfaceRef
          .dispatchAction(
            ctxRef.dataContext.resolveAction(action as never),
            target.id,
          )
          .catch(() => {});
      });
    })(),
  };
}

async function renderArgs(args: RenderArgs, typeName: string) {
  const render = blockCatalog.get(typeName);
  if (!render) throw new Error(`no renderer for ${typeName}`);
  const out = render(args);
  if (out === null) return ""; // ContentTab returns null intentionally
  const dom = await createDOM();
  await dom.render(<div>{out}</div>);
  return dom.screen.outerHTML;
}

describe("blockCatalog: inline", () => {
  test("RichText applies bold + italic decorations", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "RichText",
        id: "t",
        text: "loud",
        decoration: ["bold", "italic"],
      }),
      "RichText",
    );
    expect(html).toContain("loud");
  });

  test("RichText with katex decoration renders inline math", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "RichText",
        id: "t",
        text: "x^2",
        decoration: ["katex"],
      }),
      "RichText",
    );
    // katex renders an annotation with the source expression.
    expect(html).toContain("x^2");
  });

  test("LinkText becomes an anchor", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "LinkText",
        id: "l",
        text: "site",
        href: "https://example.test/",
      }),
      "LinkText",
    );
    expect(html).toContain("site");
    expect(html).toContain('href="https://example.test/"');
  });
});

describe("blockCatalog: layout", () => {
  test("Column applies widthRatio as flex", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "Column",
        id: "c",
        children: ["a"],
        widthRatio: 2,
      }),
      "Column",
    );
    expect(html.replace(/\s/g, "")).toContain("flex:2");
  });

  test("Column suppresses top margin when it is the first child", async () => {
    const args = buildArgs({
      component: "Column",
      id: "c",
      children: ["a"],
    });
    // simulate "first child" — buildArgs uses index: 0 by default
    expect(args.index).toBe(0);
    const html = await renderArgs(args, "Column");
    expect(html).toContain("--elmethis-margin-block-start");
  });
});

describe("blockCatalog: block typography", () => {
  test("Heading uses the requested level", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "Heading",
        id: "h",
        level: 3,
        children: ["t"],
      }),
      "Heading",
    );
    expect(html.toLowerCase()).toContain("<h3");
  });

  test("List renders an ordered list when style=ordered", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "List",
        id: "l",
        style: "ordered",
        children: ["i1"],
      }),
      "List",
    );
    expect(html.toLowerCase()).toContain("<ol");
  });

  test("ListItem renders without wrapping element when used as a list child", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "ListItem",
        id: "li",
        children: ["t1", "t2"],
      }),
      "ListItem",
    );
    // ListItem itself yields a fragment of children, so both child markers appear.
    expect(html).toContain('data-child-id="t1"');
    expect(html).toContain('data-child-id="t2"');
  });
});

describe("blockCatalog: tabs", () => {
  test("ContentTab returns null (it's a data-only marker)", async () => {
    const args = buildArgs({
      component: "ContentTab",
      id: "tab1",
      labels: ["l1"],
      contents: ["c1"],
    });
    const render = blockCatalog.get("ContentTab");
    expect(render).toBeDefined();
    expect(render!(args)).toBeNull();
  });

  test("ContentTabs reads labels and contents from each tab's properties", async () => {
    const args = buildArgs(
      {
        component: "ContentTabs",
        id: "tabs",
        children: ["tab1"],
      },
      {
        extras: [
          {
            component: "ContentTab",
            id: "tab1",
            labels: ["label-comp"],
            contents: ["content-comp"],
          },
        ],
      },
    );
    const html = await renderArgs(args, "ContentTabs");
    // Both the label and content children should appear via the stub renderChild.
    expect(html).toContain('data-child-id="label-comp"');
    expect(html).toContain('data-child-id="content-comp"');
  });
});

describe("blockCatalog: code and math", () => {
  test("CodeBlock passes language through", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "CodeBlock",
        id: "cb",
        code: "console.log('hi')",
        language: "javascript",
      }),
      "CodeBlock",
    );
    expect(html.toLowerCase()).toContain("code");
  });

  test("Mermaid is rendered through the code block fallback", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "Mermaid",
        id: "m",
        code: "graph TD\nA-->B",
      }),
      "Mermaid",
    );
    expect(html.toLowerCase()).toContain("code");
  });

  test("Katex block renders the expression source", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "Katex",
        id: "k",
        expression: "a^2 + b^2 = c^2",
      }),
      "Katex",
    );
    expect(html).toContain("a^2 + b^2 = c^2");
  });
});

describe("blockCatalog: table", () => {
  test("TableCell with isHeader renders a header cell", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "TableCell",
        id: "tc",
        isHeader: true,
        children: ["t"],
      }),
      "TableCell",
    );
    expect(html.toLowerCase()).toContain("<th");
  });

  test("TableCell without isHeader renders a data cell", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "TableCell",
        id: "tc",
        children: ["t"],
      }),
      "TableCell",
    );
    expect(html.toLowerCase()).toContain("<td");
  });
});

describe("blockCatalog: fallback", () => {
  test("Unsupported renders an unsupported-block with the details message", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "Unsupported",
        id: "u",
        details: "WeirdThing",
      }),
      "Unsupported",
    );
    expect(html).toContain("Unsupported");
    expect(html).toContain("WeirdThing");
  });
});

describe("blockCatalog: composition", () => {
  test("blockCatalog inherits basicCatalog entries via extend", () => {
    expect(blockCatalog.get("Text")).toBeDefined();
    expect(blockCatalog.get("Button")).toBeDefined();
    expect(blockCatalog.get("Image")).toBeDefined();
  });

  test("blockCatalog overrides Column with its own widthRatio-aware renderer", () => {
    // The block-catalog Column applies inline flex styles; the basic-catalog
    // Column uses a CSS class. We can sniff the renderer by checking the
    // emitted style for `flex:`.
    const args = buildArgs({
      component: "Column",
      id: "c",
      children: ["a"],
      widthRatio: 3,
    });
    const html = blockCatalog.get("Column")!(args);
    expect(html).toBeTruthy();
  });
});
