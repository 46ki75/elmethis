import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { ElmA2ui } from "../elm-a2ui";
import { blockCatalog } from "./block-catalog";

// The block catalog extends the basic catalog with the elmethis typography /
// media / code / table renderers. Rather than re-implement the qwik lead's
// isolated RenderArgs harness, we drive each renderer through the real pipeline
// (ElmA2ui with `catalog={blockCatalog}`) and assert the produced DOM. Surface
// resolution is async (the SDK's microtask emitter), so each case waits.

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

const mountSurface = (
  components: object[],
  dataModel: Record<string, unknown> = {},
) => {
  const messages: object[] = [
    {
      version: "v0.9",
      createSurface: { surfaceId: "s", catalogId: CATALOG_ID },
    },
  ];
  for (const [path, value] of Object.entries(dataModel)) {
    messages.push({
      version: "v0.9",
      updateDataModel: { surfaceId: "s", path, value },
    });
  }
  messages.push({
    version: "v0.9",
    updateComponents: { surfaceId: "s", components },
  });
  return mount(ElmA2ui, { props: { catalog: blockCatalog, messages } });
};

describe("blockCatalog — typography", () => {
  it("Heading renders an <h2> wrapping its inline child", async () => {
    const wrapper = mountSurface([
      { component: "Heading", id: "root", level: 2, children: ["t"] },
      { component: "RichText", id: "t", text: "Block Heading" },
    ]);
    await vi.waitFor(() => {
      const h = wrapper.find("h2");
      expect(h.exists()).toBe(true);
      expect(h.text()).toContain("Block Heading");
    });
  });

  it("Paragraph renders a <p>", async () => {
    const wrapper = mountSurface([
      { component: "Paragraph", id: "root", children: ["t"] },
      { component: "RichText", id: "t", text: "A paragraph." },
    ]);
    await vi.waitFor(() => {
      expect(wrapper.find("p").exists()).toBe(true);
      expect(wrapper.text()).toContain("A paragraph.");
    });
  });

  it("List renders a <ul> with list items", async () => {
    const wrapper = mountSurface([
      {
        component: "List",
        id: "root",
        style: "unordered",
        children: ["a", "b"],
      },
      { component: "RichText", id: "a", text: "alpha" },
      { component: "RichText", id: "b", text: "beta" },
    ]);
    await vi.waitFor(() => {
      expect(wrapper.find("ul").exists()).toBe(true);
      expect(wrapper.text()).toContain("alpha");
      expect(wrapper.text()).toContain("beta");
    });
  });

  it("BlockQuote renders a <blockquote>", async () => {
    const wrapper = mountSurface([
      { component: "BlockQuote", id: "root", children: ["t"] },
      { component: "RichText", id: "t", text: "quoted" },
    ]);
    await vi.waitFor(() => {
      expect(wrapper.find("blockquote").exists()).toBe(true);
      expect(wrapper.text()).toContain("quoted");
    });
  });

  it("Callout renders its inner content", async () => {
    const wrapper = mountSurface([
      { component: "Callout", id: "root", type: "tip", children: ["t"] },
      { component: "RichText", id: "t", text: "heads up" },
    ]);
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("heads up");
    });
  });
});

describe("blockCatalog — inline", () => {
  it("RichText applies decorations and renders the text", async () => {
    const wrapper = mountSurface([
      {
        component: "RichText",
        id: "root",
        text: "loud",
        decoration: ["bold", "italic"],
      },
    ]);
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("loud");
    });
  });

  it("Katex renders a math expression (mathml)", async () => {
    const wrapper = mountSurface([
      { component: "Katex", id: "root", expression: "x^2" },
    ]);
    await vi.waitFor(() => {
      // ElmKatex emits MathML via katex's output:"mathml".
      expect(wrapper.find("math").exists()).toBe(true);
    });
  });
});

describe("blockCatalog — code & table", () => {
  it("CodeBlock renders the <figure> shell with its language caption", async () => {
    const wrapper = mountSurface([
      {
        component: "CodeBlock",
        id: "root",
        code: "let x = 1;",
        language: "rust",
      },
    ]);
    // The shiki highlight is async; the figure shell + caption are synchronous.
    await vi.waitFor(() => {
      expect(wrapper.find("figure").exists()).toBe(true);
      expect(wrapper.text()).toContain("rust");
    });
  });

  it("Table renders <table> with header and body cells", async () => {
    const wrapper = mountSurface([
      { component: "Table", id: "root", header: ["hr"], body: ["br"] },
      { component: "TableRow", id: "hr", children: ["hc"] },
      { component: "TableCell", id: "hc", isHeader: true, children: ["ht"] },
      { component: "RichText", id: "ht", text: "Name" },
      { component: "TableRow", id: "br", children: ["bc"] },
      { component: "TableCell", id: "bc", children: ["bt"] },
      { component: "RichText", id: "bt", text: "Ada" },
    ]);
    await vi.waitFor(() => {
      expect(wrapper.find("table").exists()).toBe(true);
      expect(wrapper.text()).toContain("Name");
      expect(wrapper.text()).toContain("Ada");
    });
  });
});

describe("blockCatalog — tabs & fallback", () => {
  it("ContentTabs renders each tab's label and content", async () => {
    const wrapper = mountSurface([
      { component: "ContentTabs", id: "root", children: ["tab0", "tab1"] },
      { component: "ContentTab", id: "tab0", label: ["l0"], content: ["c0"] },
      { component: "ContentTab", id: "tab1", label: ["l1"], content: ["c1"] },
      { component: "RichText", id: "l0", text: "Tab One" },
      { component: "RichText", id: "c0", text: "Content One" },
      { component: "RichText", id: "l1", text: "Tab Two" },
      { component: "RichText", id: "c1", text: "Content Two" },
    ]);
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("Tab One");
      expect(wrapper.text()).toContain("Tab Two");
    });
  });

  it("Unsupported renders the fallback block", async () => {
    const wrapper = mountSurface([
      { component: "Unsupported", id: "root", details: "CustomWidget" },
    ]);
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("Unsupported component type");
      expect(wrapper.text()).toContain("CustomWidget");
    });
  });
});
