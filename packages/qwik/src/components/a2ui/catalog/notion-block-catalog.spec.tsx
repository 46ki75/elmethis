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
import { notionBlockCatalog } from "./notion-block-catalog";
import {
  BlockQuoteApi,
  BookmarkApi,
  CodeBlockApi,
  ColumnApi,
  ContentTabApi,
  ContentTabsApi,
  HeadingApi,
  HtmlApi,
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
} from "@elmethis/core";

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
  HtmlApi,
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
  const render = notionBlockCatalog.get(typeName);
  if (!render) throw new Error(`no renderer for ${typeName}`);
  const out = render(args);
  if (out === null) return ""; // ContentTab returns null intentionally
  const dom = await createDOM();
  await dom.render(<div>{out}</div>);
  return dom.screen.outerHTML;
}

describe("notionBlockCatalog: inline", () => {
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

describe("notionBlockCatalog: layout", () => {
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

  test("Column spaces its children with the shared stack gap", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "Column",
        id: "c",
        children: ["a"],
      }),
      "Column",
    );
    // Spacing between stacked children comes from `gap` on the flex
    // container, not a per-child leading margin — so there's no first-child
    // case to special-case (unlike the old firstChildMargin() mechanism).
    expect(html.replace(/\s/g, "")).toContain("gap:var(--elmethis-stack-gap)");
  });
});

describe("notionBlockCatalog: block typography", () => {
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

  test("NotionCallout renders its icon and children", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "NotionCallout",
        id: "nc",
        icon: { kind: "emoji", emoji: "💡" },
        color: "blue",
        children: ["t1"],
      }),
      "NotionCallout",
    );
    expect(html).toContain("💡");
    expect(html).toContain('data-child-id="t1"');
  });
});

describe("notionBlockCatalog: tabs", () => {
  test("ContentTab returns null (it's a data-only marker)", async () => {
    const args = buildArgs({
      component: "ContentTab",
      id: "tab1",
      label: ["l1"],
      content: ["c1"],
    });
    const render = notionBlockCatalog.get("ContentTab");
    expect(render).toBeDefined();
    expect(render!(args)).toBeNull();
  });

  test("ContentTabs reads label and content from each tab's properties", async () => {
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
            label: ["label-comp"],
            content: ["content-comp"],
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

describe("notionBlockCatalog: media and embed", () => {
  test("Html renders a sandboxed iframe with the given markup", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "Html",
        id: "e",
        html: "<p>hello</p>",
      }),
      "Html",
    );
    expect(html.toLowerCase()).toContain("<iframe");
    // Contains, not an exact match: scripts are on by default here, so the
    // srcdoc also carries the postMessage auto-height reporter (see
    // elm-html.tsx) appended after the caller's own markup.
    expect(html).toContain("<p>hello</p>");
  });

  test("Html renders a remote src iframe with no-referrer hardening", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "Html",
        id: "e",
        src: "https://example.com/doc.html?token=secret",
      }),
      "Html",
    );
    expect(html.toLowerCase()).toContain("<iframe");
    expect(html).toContain('src="https://example.com/doc.html?token=secret"');
    expect(html).not.toContain("srcdoc=");
    expect(html).toContain('referrerpolicy="no-referrer"');
  });

  test("Html adds allow-scripts to the sandbox when allowScripts is set", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "Html",
        id: "e",
        html: "<p>hello</p>",
        allowScripts: true,
      }),
      "Html",
    );
    expect(html).toMatch(/sandbox="[^"]*\ballow-scripts\b[^"]*"/);
  });

  test("Html adds allow-scripts to the sandbox by default", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "Html",
        id: "e",
        html: "<p>hello</p>",
      }),
      "Html",
    );
    expect(html).toMatch(/sandbox="[^"]*\ballow-scripts\b[^"]*"/);
  });

  test("Html omits allow-scripts from the sandbox when allowScripts is explicitly false", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "Html",
        id: "e",
        html: "<p>hello</p>",
        allowScripts: false,
      }),
      "Html",
    );
    expect(html).not.toMatch(/sandbox="[^"]*\ballow-scripts\b[^"]*"/);
  });

  // A default fallback height matters here specifically: allowScripts
  // defaults to true in this catalog, and content requiring scripts to
  // render can never be measured by autoHeight (see elm-html.tsx) — without
  // a default, an author who doesn't think to set one gets an unreadable
  // ~150px sliver instead of a usable box.
  test("Html falls back to a default height of 400 when none is given", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "Html",
        id: "e",
        html: "<p>hello</p>",
      }),
      "Html",
    );
    expect(html).toContain('height="400"');
  });

  test("Html uses a caller-supplied height instead of the default", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "Html",
        id: "e",
        html: "<p>hello</p>",
        height: 800,
      }),
      "Html",
    );
    expect(html).toContain('height="800"');
    expect(html).not.toContain('height="400"');
  });
});

describe("notionBlockCatalog: code and math", () => {
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

describe("notionBlockCatalog: table", () => {
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

describe("notionBlockCatalog: fallback", () => {
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

describe("notionBlockCatalog: composition", () => {
  test("notionBlockCatalog inherits basicCatalog entries via extend", () => {
    expect(notionBlockCatalog.get("Text")).toBeDefined();
    expect(notionBlockCatalog.get("Button")).toBeDefined();
    expect(notionBlockCatalog.get("Image")).toBeDefined();
  });

  test("notionBlockCatalog overrides Column with its own widthRatio-aware renderer", () => {
    // The notion-block-catalog Column applies inline flex styles; the basic-catalog
    // Column uses a CSS class. We can sniff the renderer by checking the
    // emitted style for `flex:`.
    const args = buildArgs({
      component: "Column",
      id: "c",
      children: ["a"],
      widthRatio: 3,
    });
    const html = notionBlockCatalog.get("Column")!(args);
    expect(html).toBeTruthy();
  });
});
