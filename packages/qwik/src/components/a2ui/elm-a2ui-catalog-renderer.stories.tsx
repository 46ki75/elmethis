import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  component$,
  noSerialize,
  type NoSerialize,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  MessageProcessor,
  Catalog,
  type ComponentApi,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";
import {
  BASIC_COMPONENTS,
  BASIC_FUNCTIONS,
} from "@a2ui/web_core/v0_9/basic_catalog";
import { type CatalogRendererMap } from "./elm-a2ui-catalog-renderer";
import { elmBasicCatalogRendererMap } from "./elm-a2ui-basic-catalog-renderer";
import { renderTree, findRootId } from "./elm-a2ui-renderer";

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

const meta: Meta = {
  title: "Components/A2UI/elm-a2ui-catalog-renderer",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`CatalogRendererMap` is a plain object mapping A2UI component type names to " +
          "render functions. Pass it to `renderTree()` to control how each component type is " +
          "rendered. Extend `elmBasicCatalogRendererMap` via spread to customise individual " +
          "types without re-implementing the full catalog.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ---- shared surface builder ----

function buildSurface(
  components: unknown[],
  dataUpdates?: unknown[],
): SurfaceModel<ComponentApi> | null {
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
  processor.processMessages([
    {
      version: "v0.9",
      createSurface: { surfaceId: "s", catalogId: CATALOG_ID },
    },
    ...(dataUpdates ?? []),
    {
      version: "v0.9",
      updateComponents: { surfaceId: "s", components },
    },
  ] as never[]);
  return captured;
}

// ---- custom catalogs (module-level constants) ----

/** Overrides the Text renderer to show a colored type badge before headings. */
const badgedTextCatalog: CatalogRendererMap = {
  ...elmBasicCatalogRendererMap,
  Text: ({ props, resolve }) => {
    const text = resolve(props.text);
    const v = (props.variant as string) ?? "body";
    const isHeading = ["h1", "h2", "h3", "h4", "h5"].includes(v);
    if (!isHeading) {
      return elmBasicCatalogRendererMap["Text"]!({ props, resolve } as never);
    }
    const sizeMap: Record<string, string> = {
      h1: "2rem",
      h2: "1.5rem",
      h3: "1.25rem",
      h4: "1.125rem",
      h5: "1rem",
    };
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          margin: "4px 0",
        }}
      >
        <span
          style={{
            background: "var(--a2ui-primary, #1976d2)",
            color: "#fff",
            borderRadius: "4px",
            padding: "2px 6px",
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          {v}
        </span>
        <span style={{ fontWeight: 700, fontSize: sizeMap[v] }}>{text}</span>
      </div>
    );
  },
};

/** Overrides the Card renderer with an accent border and tinted background. */
const accentCardCatalog: CatalogRendererMap = {
  ...elmBasicCatalogRendererMap,
  Card: ({ props, renderChild }) => (
    <div
      style={{
        borderLeft: "4px solid var(--a2ui-primary, #1976d2)",
        borderRadius: "0 8px 8px 0",
        padding: "16px",
        background: "oklch(0.97 0.01 250)",
        boxShadow: "0 1px 4px rgba(25,118,210,0.12)",
      }}
    >
      {typeof props.child === "string" ? renderChild(props.child) : null}
    </div>
  ),
};

// ---- story components ----

const DefaultStory = component$(() => {
  const surfaceSig = useSignal<
    NoSerialize<SurfaceModel<ComponentApi>> | undefined
  >();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const s = buildSurface([
      {
        component: "Column",
        id: "root",
        children: ["heading", "body", "card"],
      },
      { component: "Text", id: "heading", variant: "h2", text: "Default Catalog" },
      {
        component: "Text",
        id: "body",
        text: "Rendered with elmBasicCatalogRendererMap via renderTree().",
      },
      { component: "Card", id: "card", child: "cardText" },
      {
        component: "Text",
        id: "cardText",
        text: "This card uses the default Card renderer.",
      },
    ]);
    if (s) surfaceSig.value = noSerialize(s);
  });

  const surface = surfaceSig.value;
  const rootId = surface ? findRootId(surface) : null;

  return rootId && surface ? (
    <div>{renderTree(rootId, surface, elmBasicCatalogRendererMap)}</div>
  ) : null;
});

const BadgedTextStory = component$(() => {
  const surfaceSig = useSignal<
    NoSerialize<SurfaceModel<ComponentApi>> | undefined
  >();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const s = buildSurface([
      {
        component: "Column",
        id: "root",
        children: ["h1", "h2", "h3", "body"],
      },
      { component: "Text", id: "h1", variant: "h1", text: "Page Title" },
      { component: "Text", id: "h2", variant: "h2", text: "Section Heading" },
      { component: "Text", id: "h3", variant: "h3", text: "Sub-section" },
      {
        component: "Text",
        id: "body",
        text: "Regular body text is unchanged by the override.",
      },
    ]);
    if (s) surfaceSig.value = noSerialize(s);
  });

  const surface = surfaceSig.value;
  const rootId = surface ? findRootId(surface) : null;

  return rootId && surface ? (
    <div>{renderTree(rootId, surface, badgedTextCatalog)}</div>
  ) : null;
});

const AccentCardStory = component$(() => {
  const surfaceSig = useSignal<
    NoSerialize<SurfaceModel<ComponentApi>> | undefined
  >();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const s = buildSurface([
      {
        component: "Column",
        id: "root",
        children: ["c1", "c2", "c3"],
      },
      { component: "Card", id: "c1", child: "t1" },
      { component: "Text", id: "t1", text: "First item" },
      { component: "Card", id: "c2", child: "t2" },
      { component: "Text", id: "t2", text: "Second item" },
      { component: "Card", id: "c3", child: "t3" },
      { component: "Text", id: "t3", text: "Third item" },
    ]);
    if (s) surfaceSig.value = noSerialize(s);
  });

  const surface = surfaceSig.value;
  const rootId = surface ? findRootId(surface) : null;

  return rootId && surface ? (
    <div>{renderTree(rootId, surface, accentCardCatalog)}</div>
  ) : null;
});

// ---- stories ----

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Calls `renderTree()` with `elmBasicCatalogRendererMap`. " +
          "This is the same rendering that `ElmA2uiSurfaceRenderer` uses internally.",
      },
    },
  },
  render: () => <DefaultStory />,
};

export const OverrideText: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Spreads `elmBasicCatalogRendererMap` and overrides the `Text` renderer to prepend " +
          "a colored badge showing the heading level. Body text falls through to the default renderer. " +
          "Pattern: `{ ...elmBasicCatalogRendererMap, Text: customTextRenderer }`.",
      },
    },
  },
  render: () => <BadgedTextStory />,
};

export const OverrideCard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Spreads `elmBasicCatalogRendererMap` and overrides the `Card` renderer " +
          "with an accent left-border style. All other component types use the default renderer. " +
          "Pattern: `{ ...elmBasicCatalogRendererMap, Card: customCardRenderer }`.",
      },
    },
  },
  render: () => <AccentCardStory />,
};
