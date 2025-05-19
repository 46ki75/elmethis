<template>
  <component :is="() => renderResult"></component>
</template>

<script setup lang="ts">
import type { Component, ComponentMap } from "jarkup-ts";
import { defineAsyncComponent, h, useCssModule, VNode } from "vue";

import { ElmBlockFallback } from "../..";

export interface ElmJsonComponentRendererProps {
  jsonComponents: Component[];
}

const props = withDefaults(defineProps<ElmJsonComponentRendererProps>(), {});

const style = useCssModule();

const AsyncElmInlineText = defineAsyncComponent({
  loader: () => import("../typography/ElmInlineText.vue"),
});

const AsyncElmKatex = defineAsyncComponent({
  loader: () => import("../code/ElmKatex.vue"),
});

const AsyncElmInlineIcon = defineAsyncComponent({
  loader: () => import("../icon/ElmInlineIcon.vue"),
});

const AsyncElmHeading = defineAsyncComponent({
  loader: () => import("../typography/ElmHeading.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmParagraph = defineAsyncComponent({
  loader: () => import("../typography/ElmParagraph.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmList = defineAsyncComponent({
  loader: () => import("../typography/ElmList.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmBlockQuote = defineAsyncComponent({
  loader: () => import("../typography/ElmBlockQuote.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmCallout = defineAsyncComponent({
  loader: () => import("../typography/ElmCallout.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmDivider = defineAsyncComponent({
  loader: () => import("../typography/ElmDivider.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmToggle = defineAsyncComponent({
  loader: () => import("../containments/ElmToggle.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmBookmark = defineAsyncComponent({
  loader: () => import("../navigation/ElmBookmark.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmFile = defineAsyncComponent({
  loader: () => import("../media/ElmFile.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmImage = defineAsyncComponent({
  loader: () => import("../media/ElmImage.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmCodeBlock = defineAsyncComponent({
  loader: () => import("../code/ElmCodeBlock.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmTable = defineAsyncComponent({
  loader: () => import("../table/ElmTable.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmTableHeader = defineAsyncComponent({
  loader: () => import("../table/ElmTableHeader.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmTableBody = defineAsyncComponent({
  loader: () => import("../table/ElmTableBody.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmTableRow = defineAsyncComponent({
  loader: () => import("../table/ElmTableRow.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmTableCell = defineAsyncComponent({
  loader: () => import("../table/ElmTableCell.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmUnsupportedBlock = defineAsyncComponent({
  loader: () => import("../fallback/ElmUnsupportedBlock.vue"),
  loadingComponent: ElmBlockFallback,
});

type RenderFunctionMap<R> = {
  [K in keyof ComponentMap]: (args: ComponentMap[K]) => R;
};

const defaultRenderFunctionMap = (
  render: (jsonComponents: Component[]) => VNode[]
): RenderFunctionMap<VNode> => {
  return {
    Text: ({ props }) => {
      if (props.katex) {
        return h(AsyncElmKatex, { expression: props.text, block: false });
      } else {
        return h(AsyncElmInlineText, {
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
    Icon: ({ props }) =>
      h(AsyncElmInlineIcon, { src: props.src, alt: props.alt }),
    Heading: ({ props, slots }) =>
      h(
        AsyncElmHeading,
        {
          level: props.level,
        },
        { default: () => render(slots.default) }
      ),
    Paragraph: ({ slots }) =>
      h(AsyncElmParagraph, {}, { default: () => render(slots.default) }),
    ListItem: ({ slots }) =>
      h("li", {}, { default: () => render(slots.default) }),
    List: ({ props, slots }) =>
      h(
        AsyncElmList,
        {
          listStyle: props?.listStyle === "unordered" ? "unordered" : "ordered",
        },
        { default: () => render(slots.default) }
      ),
    BlockQuote: ({ props, slots }) =>
      h(
        AsyncElmBlockQuote,
        { cite: props?.cite },
        { default: () => render(slots.default) }
      ),
    Callout: ({ props, slots }) =>
      h(
        AsyncElmCallout,
        { type: props?.type },
        { default: () => render(slots.default) }
      ),
    Divider: ({}) => h(AsyncElmDivider, {}),
    Toggle: ({ slots }) =>
      h(
        AsyncElmToggle,
        {},
        {
          default: () => render(slots.default),
          summary: () => render(slots.summary),
        }
      ),
    Bookmark: ({ props }) =>
      h(AsyncElmBookmark, {
        url: props.url,
        title: props.title,
        description: props.description,
        image: props.image,
      }),
    File: ({ props }) => h(AsyncElmFile, { src: props.src, name: props.name }),
    Image: ({ props }) =>
      h(AsyncElmImage, {
        src: props.src,
        alt: props.alt,
        block: true,
        enableModal: true,
      }),
    CodeBlock: ({ props, slots }) =>
      slots != null
        ? h(
            AsyncElmCodeBlock,
            { code: props.code, language: props.language },
            { default: () => render(slots.default) }
          )
        : h(AsyncElmCodeBlock, { code: props.code, language: props.language }),
    Katex: ({ props }) =>
      h(AsyncElmKatex, { expression: props.expression, block: true }),
    Table: ({ props, slots }) => {
      let header: ReturnType<typeof h> | undefined = undefined;

      if (slots.header != null) {
        const headerSlot = slots.header;
        header = h(
          AsyncElmTableHeader,
          {},
          { default: () => render(headerSlot) }
        );
      }

      return h(
        AsyncElmTable,
        { caption: props?.caption, hasRowHeader: props?.hasRowHeader },
        {
          body: () =>
            h(AsyncElmTableBody, {}, { default: () => render(slots.body) }),
          header: header ? () => header : undefined,
        }
      );
    },
    TableRow: ({ slots }) =>
      h(AsyncElmTableRow, {}, { default: () => render(slots.default) }),
    TableCell: ({ slots }) =>
      h(AsyncElmTableCell, {}, { default: () => render(slots.default) }),
    ColumnList: ({ slots }) =>
      h(
        "div",
        { class: style["column-list"] },
        { default: () => render(slots.default) }
      ),
    Column: ({ slots }) =>
      h(
        "div",
        { class: style.column },
        { default: () => render(slots.default) }
      ),
    Unsupported: ({ props }) =>
      h(AsyncElmUnsupportedBlock, { details: props?.details }),
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

const renderResult = render(props.jsonComponents);
</script>

<style module lang="scss">
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
