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
import {
  ElmA2uiSurfaceRenderer,
  type ElmA2uiSurfaceRendererProps,
} from "./elm-a2ui-surface-renderer";

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

const meta: Meta<ElmA2uiSurfaceRendererProps> = {
  title: "Components/A2UI/elm-a2ui-surface-renderer",
  component: ElmA2uiSurfaceRenderer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Low-level renderer for a single pre-built A2UI `SurfaceModel`. " +
          "Handles click/input/change event delegation and re-renders on model updates. " +
          "For higher-level usage with message processing, use `ElmA2uiRenderer` instead.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<ElmA2uiSurfaceRendererProps>;

// ---- helpers ----

function buildSurface(messages: unknown[]): SurfaceModel<ComponentApi> | null {
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
  processor.processMessages(messages as never[]);
  return captured;
}

// ---- story components (must be module-level for Qwik optimizer) ----

const TypographyStory = component$(() => {
  const surfaceSig = useSignal<
    NoSerialize<SurfaceModel<ComponentApi>> | undefined
  >();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const s = buildSurface([
      {
        version: "v0.9",
        createSurface: { surfaceId: "s", catalogId: CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [
            {
              component: "Column",
              id: "root",
              children: ["h1", "h2", "h3", "h4", "h5", "body", "caption"],
            },
            { component: "Text", id: "h1", variant: "h1", text: "Heading 1" },
            { component: "Text", id: "h2", variant: "h2", text: "Heading 2" },
            { component: "Text", id: "h3", variant: "h3", text: "Heading 3" },
            { component: "Text", id: "h4", variant: "h4", text: "Heading 4" },
            { component: "Text", id: "h5", variant: "h5", text: "Heading 5" },
            {
              component: "Text",
              id: "body",
              text: "Body text — the default paragraph style.",
            },
            {
              component: "Text",
              id: "caption",
              variant: "caption",
              text: "Caption text — small, muted.",
            },
          ],
        },
      },
    ]);
    if (s) surfaceSig.value = noSerialize(s);
  });

  return surfaceSig.value ? (
    <ElmA2uiSurfaceRenderer surface={surfaceSig.value} />
  ) : null;
});

const FormsStory = component$(() => {
  const surfaceSig = useSignal<
    NoSerialize<SurfaceModel<ComponentApi>> | undefined
  >();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const s = buildSurface([
      {
        version: "v0.9",
        createSurface: { surfaceId: "s", catalogId: CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [
            {
              component: "Column",
              id: "root",
              children: ["tf1", "tf2", "tf3", "check", "slider"],
            },
            {
              component: "TextField",
              id: "tf1",
              label: "Short text",
              text: "",
              textFieldType: "shortText",
            },
            {
              component: "TextField",
              id: "tf2",
              label: "Password",
              text: "",
              textFieldType: "obscured",
            },
            {
              component: "TextField",
              id: "tf3",
              label: "Number",
              text: "42",
              textFieldType: "number",
            },
            {
              component: "CheckBox",
              id: "check",
              label: "Enable feature",
              checked: true,
            },
            {
              component: "Slider",
              id: "slider",
              minValue: 0,
              maxValue: 100,
              value: 60,
            },
          ],
        },
      },
    ]);
    if (s) surfaceSig.value = noSerialize(s);
  });

  return surfaceSig.value ? (
    <ElmA2uiSurfaceRenderer surface={surfaceSig.value} />
  ) : null;
});

const DataListStory = component$(() => {
  const surfaceSig = useSignal<
    NoSerialize<SurfaceModel<ComponentApi>> | undefined
  >();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
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
      {
        version: "v0.9",
        updateDataModel: {
          surfaceId: "s",
          path: "/fruits",
          value: [
            { name: "Apple" },
            { name: "Banana" },
            { name: "Cherry" },
            { name: "Durian" },
          ],
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [
            {
              component: "List",
              id: "root",
              children: { componentId: "item", path: "/fruits" },
            },
            { component: "Card", id: "item", child: "label" },
            { component: "Text", id: "label", text: { path: "name" } },
          ],
        },
      },
    ] as never[]);
    if (captured) surfaceSig.value = noSerialize(captured);
  });

  return surfaceSig.value ? (
    <ElmA2uiSurfaceRenderer surface={surfaceSig.value} />
  ) : null;
});

// ---- stories ----

export const Typography: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "All `Text` variants — h1 through h5, body, and caption — passed as a " +
          "pre-built `SurfaceModel`. Demonstrates that `ElmA2uiSurfaceRenderer` " +
          "works independently of `MessageProcessor`.",
      },
    },
  },
  render: () => <TypographyStory />,
};

export const Forms: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Form fields rendered from a pre-built surface: `TextField` (text, password, number), " +
          "`CheckBox`, and `Slider`.",
      },
    },
  },
  render: () => <FormsStory />,
};

export const DataDrivenList: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Data-driven `List` with a `/fruits` data model and a `Card` + `Text` template. " +
          "Shows that `updateDataModel` messages can be applied to the surface before " +
          "passing it to the renderer.",
      },
    },
  },
  render: () => <DataListStory />,
};
