import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { ElmA2ui } from "../elm-a2ui";
import { blockCatalog } from "./block-catalog";

// These stories drive ElmA2ui with the block catalog so the elmethis
// typography / code / table / tabs renderers are exercised end-to-end.
const meta = {
  title: "Components/A2UI/block-catalog",
  component: ElmA2ui,
  tags: ["autodocs"],
  args: { catalog: blockCatalog },
} satisfies Meta<typeof ElmA2ui>;

export default meta;
type Story = StoryObj<typeof meta>;

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

const surface = (components: object[]): object[] => [
  { version: "v0.9", createSurface: { surfaceId: "s", catalogId: CATALOG_ID } },
  { version: "v0.9", updateComponents: { surfaceId: "s", components } },
];

export const Document: Story = {
  args: {
    messages: surface([
      {
        component: "Column",
        id: "root",
        children: ["h", "p", "quote", "code", "list"],
      },
      { component: "Heading", id: "h", level: 2, children: ["ht"] },
      { component: "RichText", id: "ht", text: "Block catalog document" },
      { component: "Paragraph", id: "p", children: ["pt"] },
      {
        component: "RichText",
        id: "pt",
        text: "Rich typography rendered from A2UI messages.",
      },
      { component: "BlockQuote", id: "quote", children: ["qt"] },
      { component: "RichText", id: "qt", text: "A quoted line." },
      {
        component: "CodeBlock",
        id: "code",
        language: "rust",
        caption: "src/main.rs",
        code: 'fn main() {\n    println!("hello");\n}',
      },
      {
        component: "List",
        id: "list",
        style: "ordered",
        children: ["i1", "i2"],
      },
      { component: "RichText", id: "i1", text: "First" },
      { component: "RichText", id: "i2", text: "Second" },
    ]),
  },
};

export const Callouts: Story = {
  args: {
    messages: surface([
      { component: "Column", id: "root", children: ["note", "warn"] },
      { component: "Callout", id: "note", type: "note", children: ["nt"] },
      { component: "RichText", id: "nt", text: "An informational note." },
      { component: "Callout", id: "warn", type: "warning", children: ["wt"] },
      { component: "RichText", id: "wt", text: "A warning callout." },
    ]),
  },
};

export const Tabs: Story = {
  args: {
    messages: surface([
      { component: "ContentTabs", id: "root", children: ["t0", "t1"] },
      { component: "ContentTab", id: "t0", label: ["l0"], content: ["c0"] },
      { component: "ContentTab", id: "t1", label: ["l1"], content: ["c1"] },
      { component: "RichText", id: "l0", text: "Overview" },
      { component: "Paragraph", id: "c0", children: ["c0t"] },
      { component: "RichText", id: "c0t", text: "First tab content." },
      { component: "RichText", id: "l1", text: "Details" },
      { component: "Paragraph", id: "c1", children: ["c1t"] },
      { component: "RichText", id: "c1t", text: "Second tab content." },
    ]),
  },
};

export const Table: Story = {
  args: {
    messages: surface([
      { component: "Table", id: "root", header: ["hr"], body: ["r1", "r2"] },
      { component: "TableRow", id: "hr", children: ["h1", "h2"] },
      { component: "TableCell", id: "h1", isHeader: true, children: ["h1t"] },
      { component: "TableCell", id: "h2", isHeader: true, children: ["h2t"] },
      { component: "RichText", id: "h1t", text: "Name" },
      { component: "RichText", id: "h2t", text: "Role" },
      { component: "TableRow", id: "r1", children: ["c11", "c12"] },
      { component: "TableCell", id: "c11", children: ["c11t"] },
      { component: "TableCell", id: "c12", children: ["c12t"] },
      { component: "RichText", id: "c11t", text: "Ada" },
      { component: "RichText", id: "c12t", text: "Engineer" },
      { component: "TableRow", id: "r2", children: ["c21", "c22"] },
      { component: "TableCell", id: "c21", children: ["c21t"] },
      { component: "TableCell", id: "c22", children: ["c22t"] },
      { component: "RichText", id: "c21t", text: "Grace" },
      { component: "RichText", id: "c22t", text: "Admiral" },
    ]),
  },
};
