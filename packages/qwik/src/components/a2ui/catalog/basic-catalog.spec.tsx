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
import { basicCatalog } from "./basic-catalog";

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

interface ComponentSpec {
  component: string;
  id: string;
  [k: string]: unknown;
}

/**
 * Builds a single-component surface and the RenderArgs needed to invoke one of
 * its renderers in isolation. Other components referenced via children/child
 * props need to be passed in `extras` so they exist in the surface model.
 */
function buildArgs(
  target: ComponentSpec,
  options: {
    dataModel?: Record<string, unknown>;
    extras?: ComponentSpec[];
  } = {},
): RenderArgs {
  const catalog = new Catalog(
    CATALOG_ID,
    BASIC_COMPONENTS as ComponentApi[],
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

  // Stub renderChild — wraps the id in a marker so assertions can see it.
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
      // `$()` verifies captures at construction time; plain class
      // instances fail the check. The helper exists only to satisfy the
      // RenderArgs shape for unit tests that don't actually exercise the
      // QRL — wrap the live references in `noSerialize` so the captures
      // are formally serializable while still callable in-process.
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
  const render = basicCatalog.get(typeName);
  if (!render) throw new Error(`no renderer for ${typeName}`);
  const out = render(args);
  const dom = await createDOM();
  await dom.render(<div>{out}</div>);
  return dom.screen.outerHTML;
}

describe("basicCatalog: text", () => {
  test("body variant renders an ElmParagraph", async () => {
    const html = await renderArgs(
      buildArgs({ component: "Text", id: "t", text: "Hello" }),
      "Text",
    );
    expect(html).toContain("Hello");
    expect(html.toLowerCase()).toContain("<p");
  });

  test("h2 variant renders a heading of the right level", async () => {
    const html = await renderArgs(
      buildArgs({ component: "Text", id: "t", text: "Title", variant: "h2" }),
      "Text",
    );
    expect(html).toContain("Title");
    expect(html.toLowerCase()).toContain("<h2");
  });

  test("caption variant renders as inline text", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "Text",
        id: "t",
        text: "small",
        variant: "caption",
      }),
      "Text",
    );
    expect(html).toContain("small");
  });

  test("text resolves a path binding from the data model", async () => {
    const html = await renderArgs(
      buildArgs(
        { component: "Text", id: "t", text: { path: "/user/name" } },
        { dataModel: { "/user/name": "Ada" } },
      ),
      "Text",
    );
    expect(html).toContain("Ada");
  });
});

describe("basicCatalog: layout", () => {
  test("Row applies justify and align CSS", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "Row",
        id: "r",
        children: ["a", "b"],
        justify: "spaceBetween",
        align: "end",
      }),
      "Row",
    );
    expect(html).toContain("space-between");
    expect(html).toContain("flex-end");
    expect(html).toContain('data-child-id="a"');
    expect(html).toContain('data-child-id="b"');
  });

  test("List with horizontal direction adds the horizontal class", async () => {
    const args = buildArgs({
      component: "List",
      id: "l",
      children: ["a"],
      direction: "horizontal",
    });
    const html = await renderArgs(args, "List");
    expect(html).toMatch(/class="[^"]*list-horizontal/);
  });
});

describe("basicCatalog: interactive", () => {
  // Post-Phase-2 the renderers no longer emit `data-a2ui-bind` /
  // `data-a2ui-action` attributes. Write-back and action dispatch are
  // wired through inline `onInput$` / `onChange$` / `onClick$` QRLs that
  // call `setBinding$` and `dispatchAction$`. The remaining structural
  // assertions confirm the renderer produces the expected control type
  // and reflects the resolved value.
  test("Button renders a clickable div with role=button", async () => {
    const args = buildArgs({
      component: "Button",
      id: "btn",
      child: "label",
      action: { action: "submit" },
    });
    const html = await renderArgs(args, "Button");
    expect(html).toContain('role="button"');
    expect(html).toContain("label");
  });

  test("TextField renders an <input> with the resolved value", async () => {
    const args = buildArgs({
      component: "TextField",
      id: "tf",
      label: "Name",
    });
    const html = await renderArgs(args, "TextField");
    expect(html).toContain("<input");
    expect(html).toContain("Name");
  });

  // BUG repro (review #5): the `longText` variant of TextField is meant to
  // accept multi-line input but currently maps to <input type="text"> which is
  // single-line. Expected: a <textarea> (or an <input> with a multi-line affordance).
  test("TextField longText variant renders a multi-line control", async () => {
    const args = buildArgs({
      component: "TextField",
      id: "tf",
      label: "Notes",
      variant: "longText",
    });
    const html = await renderArgs(args, "TextField");
    expect(html.toLowerCase()).toContain("<textarea");
  });

  test("CheckBox reflects a boolean path binding", async () => {
    const args = buildArgs(
      {
        component: "CheckBox",
        id: "cb",
        label: "Agree",
        value: { path: "/form/agree" },
      },
      { dataModel: { "/form/agree": true } },
    );
    const html = await renderArgs(args, "CheckBox");
    // Boolean attribute serializes as `checked=""` in HTML5.
    expect(html).toMatch(/<input[^>]*\bchecked\b/);
  });

  test("Slider passes min/max and a numeric value", async () => {
    const args = buildArgs({
      component: "Slider",
      id: "s",
      value: 30,
      min: 0,
      max: 100,
    });
    const html = await renderArgs(args, "Slider");
    expect(html).toContain('type="range"');
    expect(html).toContain('min="0"');
    expect(html).toContain('max="100"');
    expect(html).toContain('value="30"');
  });

  test("ChoicePicker single-select uses radio inputs", async () => {
    const args = buildArgs({
      component: "ChoicePicker",
      id: "cp",
      value: [],
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
    });
    const html = await renderArgs(args, "ChoicePicker");
    expect(html).toContain('type="radio"');
    expect(html).not.toContain('type="checkbox"');
  });

  test("ChoicePicker multipleSelection uses checkboxes", async () => {
    const args = buildArgs({
      component: "ChoicePicker",
      id: "cp",
      variant: "multipleSelection",
      value: ["a"],
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
    });
    const html = await renderArgs(args, "ChoicePicker");
    expect(html).toContain('type="checkbox"');
    expect(html).not.toContain('type="radio"');
  });

  test("DateTimeInput type depends on enableDate / enableTime", async () => {
    const dateOnly = await renderArgs(
      buildArgs({
        component: "DateTimeInput",
        id: "dt",
        enableDate: true,
      }),
      "DateTimeInput",
    );
    expect(dateOnly).toContain('type="date"');

    const both = await renderArgs(
      buildArgs({
        component: "DateTimeInput",
        id: "dt",
        enableDate: true,
        enableTime: true,
      }),
      "DateTimeInput",
    );
    expect(both).toContain('type="datetime-local"');
  });
});

describe("basicCatalog: media", () => {
  test("Image uses the resolved url and object-fit", async () => {
    const html = await renderArgs(
      buildArgs({
        component: "Image",
        id: "img",
        url: "https://example.test/a.png",
        fit: "contain",
        description: "alt text",
      }),
      "Image",
    );
    expect(html).toContain('src="https://example.test/a.png"');
    expect(html).toContain('alt="alt text"');
    expect(html.replace(/\s/g, "")).toContain("object-fit:contain");
  });

  test("Divider with vertical axis adds the vertical class", async () => {
    const html = await renderArgs(
      buildArgs({ component: "Divider", id: "d", axis: "vertical" }),
      "Divider",
    );
    expect(html).toMatch(/class="[^"]*divider-vertical/);
  });
});
