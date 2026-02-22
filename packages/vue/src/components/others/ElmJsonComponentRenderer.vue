<template>
  <div :class="$style['jarkup-body']">
    <component :is="components" />
  </div>
</template>

<script setup lang="ts">
import type { Component, ComponentMap, InlineComponent } from "jarkup-ts";
import { h, useCssModule, VNode, ref, watch, computed } from "vue";

import ElmInlineText from "../typography/ElmInlineText.vue";
import ElmKatex from "../code/ElmKatex.vue";
import ElmMermaid from "../code/ElmMermaid.vue";
import ElmInlineIcon from "../icon/ElmInlineIcon.vue";
import ElmHeading from "../typography/ElmHeading.vue";
import ElmParagraph from "../typography/ElmParagraph.vue";
import ElmList from "../typography/ElmList.vue";
import ElmBlockQuote from "../typography/ElmBlockQuote.vue";
import ElmCallout from "../typography/ElmCallout.vue";
import ElmDivider from "../typography/ElmDivider.vue";
import ElmToggle from "../containments/ElmToggle.vue";
import ElmBookmark from "../navigation/ElmBookmark.vue";
import ElmFile from "../media/ElmFile.vue";
import ElmImage from "../media/ElmImage.vue";
import ElmCodeBlock from "../code/ElmCodeBlock.vue";
import ElmTable from "../table/ElmTable.vue";
import ElmTableHeader from "../table/ElmTableHeader.vue";
import ElmTableBody from "../table/ElmTableBody.vue";
import ElmTableRow from "../table/ElmTableRow.vue";
import ElmTableCell from "../table/ElmTableCell.vue";
import ElmUnsupportedBlock from "../fallback/ElmUnsupportedBlock.vue";
import { kebabCase } from "lodash-es";

export interface ElmJsonComponentRendererProps {
  jsonComponents: Component[];
}

const props = withDefaults(defineProps<ElmJsonComponentRendererProps>(), {});

const style = useCssModule();

type RenderFunctionMap<R> = {
  [K in keyof ComponentMap]: (args: ComponentMap[K]) => R;
};

const convertInlineComponentsToPlainText = (
  inlineComponents: InlineComponent[],
): string => {
  return inlineComponents
    .map((component) => {
      if (component.type === "Text") {
        return component.props.text;
      } else {
        return "";
      }
    })
    .join("");
};

const defaultRenderFunctionMap = (
  render: (jsonComponents: Component[]) => VNode[],
): RenderFunctionMap<VNode> => {
  return {
    Text: ({ props }) => {
      if (props.katex) {
        return h(ElmKatex, { expression: props.text, block: false });
      } else {
        return h(ElmInlineText, {
          text: props.text,
          color: props.color,
          backgroundColor: props.backgroundColor,
          bold: props.bold,
          italic: props.italic,
          underline: props.underline,
          strikethrough: props.strikethrough,
          code: props.code,
          ruby: props.ruby,
          href: props.href,
          favicon: props.favicon,
        });
      }
    },
    Icon: ({ props }) => h(ElmInlineIcon, { src: props.src, alt: props.alt }),
    Heading: ({ props, slots }) =>
      h(
        ElmHeading,
        {
          level: props.level,
          id: kebabCase(convertInlineComponentsToPlainText(slots.default)),
        },
        { default: () => render(slots.default) },
      ),
    Paragraph: ({ slots }) =>
      h(ElmParagraph, {}, { default: () => render(slots.default) }),
    ListItem: ({ slots }) =>
      h("li", {}, { default: () => render(slots.default) }),
    List: ({ props, slots }) =>
      h(
        ElmList,
        {
          listStyle: props?.listStyle === "unordered" ? "unordered" : "ordered",
        },
        { default: () => render(slots.default) },
      ),
    BlockQuote: ({ props, slots }) =>
      h(
        ElmBlockQuote,
        { cite: props?.cite },
        { default: () => render(slots.default) },
      ),
    Callout: ({ props, slots }) =>
      h(
        ElmCallout,
        { type: props?.type },
        { default: () => render(slots.default) },
      ),
    Divider: ({}) => h(ElmDivider, {}),
    Toggle: ({ slots }) =>
      h(
        ElmToggle,
        {},
        {
          default: () => render(slots.default),
          summary: () => render(slots.summary),
        },
      ),
    Bookmark: ({ props }) =>
      h(ElmBookmark, {
        url: props.url,
        title: props.title,
        description: props.description,
        image: props.image,
      }),
    File: ({ props }) => h(ElmFile, { src: props.src, name: props.name }),
    Image: ({ props }) =>
      h(ElmImage, {
        src: props.src,
        alt: props.alt,
        block: true,
        enableModal: true,
      }),
    CodeBlock: ({ props, slots }) =>
      slots != null
        ? h(
            ElmCodeBlock,
            { code: props.code, language: props.language },
            { default: () => render(slots.default) },
          )
        : h(ElmCodeBlock, { code: props.code, language: props.language }),
    Katex: ({ props }) =>
      h(ElmKatex, { expression: props.expression, block: true }),
    Mermaid: ({ props }) => h(ElmMermaid, { code: props.code }),
    Table: ({ props, slots }) => {
      let header: ReturnType<typeof h> | undefined = undefined;

      if (slots.header != null) {
        const headerSlot = slots.header;
        header = h(ElmTableHeader, {}, { default: () => render(headerSlot) });
      }

      return h(
        ElmTable,
        { caption: props?.caption, hasRowHeader: props?.hasRowHeader },
        {
          body: () =>
            h(ElmTableBody, {}, { default: () => render(slots.body) }),
          header: header ? () => header : undefined,
        },
      );
    },
    TableRow: ({ slots }) =>
      h(ElmTableRow, {}, { default: () => render(slots.default) }),
    TableCell: ({ slots }) =>
      h(ElmTableCell, {}, { default: () => render(slots.default) }),
    ColumnList: ({ slots }) =>
      h(
        "div",
        { class: style["column-list"] },
        { default: () => render(slots.default) },
      ),
    Column: ({ slots }) =>
      h(
        "div",
        { class: style.column },
        { default: () => render(slots.default) },
      ),
    Unsupported: ({ props }) =>
      h(ElmUnsupportedBlock, { details: props?.details }),
  };
};

const render = (jsonComponents: Component[]): VNode[] => {
  const results: VNode[] = [];

  for (const component of jsonComponents) {
    const renderFunction = defaultRenderFunctionMap(render)[component.type];
    results.push(renderFunction(component as any));
  }

  return results;
};

const renderResult = ref<VNode[]>(render(props.jsonComponents));

const components = computed(() => ({
  render: () => renderResult.value,
}));

watch(
  () => props.jsonComponents,
  (newComponents) => {
    renderResult.value = render(newComponents);
  },
);
</script>

<style module lang="scss">
.jarkup-body > * + * {
  margin-block-start: 2em;
}

.column-list {
  box-sizing: content-box;
  padding-block: 0.25rem;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  justify-content: space-around;
  overflow: auto;
}

.column {
  flex: 1;
}
</style>
