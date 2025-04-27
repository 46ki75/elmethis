<template>
  <component :is="() => renderResult"></component>
</template>

<script setup lang="ts">
import type { Component, ComponentMap } from '@elmethis/json-component-types'
import { defineAsyncComponent, h, VNode } from 'vue'

import { ElmBlockFallback } from '../..'

export interface ElmJsonComponentRendererProps {
  jsonComponents: Component[]
}

const props = withDefaults(defineProps<ElmJsonComponentRendererProps>(), {})

const AsyncElmInlineText = defineAsyncComponent({
  loader: () => import('../typography/ElmInlineText.vue')
})

const AsyncElmKatex = defineAsyncComponent({
  loader: () => import('../code/ElmKatex.vue')
})

const AsyncElmInlineIcon = defineAsyncComponent({
  loader: () => import('../icon/ElmInlineIcon.vue')
})

const AsyncElmHeading = defineAsyncComponent({
  loader: () => import('../typography/ElmHeading.vue'),
  loadingComponent: ElmBlockFallback
})

const AsyncElmParagraph = defineAsyncComponent({
  loader: () => import('../typography/ElmParagraph.vue'),
  loadingComponent: ElmBlockFallback
})

const AsyncElmList = defineAsyncComponent({
  loader: () => import('../typography/ElmList.vue'),
  loadingComponent: ElmBlockFallback
})

const AsyncElmBlockQuote = defineAsyncComponent({
  loader: () => import('../typography/ElmBlockQuote.vue'),
  loadingComponent: ElmBlockFallback
})

const AsyncElmCallout = defineAsyncComponent({
  loader: () => import('../typography/ElmCallout.vue'),
  loadingComponent: ElmBlockFallback
})

const AsyncElmDivider = defineAsyncComponent({
  loader: () => import('../typography/ElmDivider.vue'),
  loadingComponent: ElmBlockFallback
})

const AsyncElmToggle = defineAsyncComponent({
  loader: () => import('../containments/ElmToggle.vue'),
  loadingComponent: ElmBlockFallback
})

const AsyncElmBookmark = defineAsyncComponent({
  loader: () => import('../navigation/ElmBookmark.vue'),
  loadingComponent: ElmBlockFallback
})

const AsyncElmFile = defineAsyncComponent({
  loader: () => import('../media/ElmFile.vue'),
  loadingComponent: ElmBlockFallback
})

const AsyncElmBlockImage = defineAsyncComponent({
  loader: () => import('../media/ElmBlockImage.vue'),
  loadingComponent: ElmBlockFallback
})

const AsyncElmCodeBlock = defineAsyncComponent({
  loader: () => import('../code/ElmCodeBlock.vue'),
  loadingComponent: ElmBlockFallback
})

const AsyncElmTable = defineAsyncComponent({
  loader: () => import('../table/ElmTable.vue'),
  loadingComponent: ElmBlockFallback
})

const AsyncElmTableHeader = defineAsyncComponent({
  loader: () => import('../table/ElmTableHeader.vue'),
  loadingComponent: ElmBlockFallback
})

const AsyncElmTableBody = defineAsyncComponent({
  loader: () => import('../table/ElmTableBody.vue'),
  loadingComponent: ElmBlockFallback
})

const AsyncElmTableRow = defineAsyncComponent({
  loader: () => import('../table/ElmTableRow.vue'),
  loadingComponent: ElmBlockFallback
})

const AsyncElmTableCell = defineAsyncComponent({
  loader: () => import('../table/ElmTableCell.vue'),
  loadingComponent: ElmBlockFallback
})

type RenderFunctionMap<R> = {
  [K in keyof ComponentMap]: (args: ComponentMap[K]) => R
}

const defaultRenderFunctionMap = (
  render: (jsonComponents: Component[]) => VNode[]
): RenderFunctionMap<VNode> => {
  return {
    Text: ({ props }) => {
      if (props.katex) {
        return h(AsyncElmKatex, { expression: props.text, block: false })
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
          favicon: props.favicon
        })
      }
    },
    Icon: ({ props }) =>
      h(AsyncElmInlineIcon, { src: props.src, alt: props.alt }),
    Heading: ({ props, slots }) =>
      h(
        AsyncElmHeading,
        {
          level: props.level
        },
        { default: render(slots.default) }
      ),
    Paragraph: ({ slots }) =>
      h(AsyncElmParagraph, {}, { default: render(slots.default) }),
    ListItem: ({ slots }) => h('li', {}, render(slots.default)),
    List: ({ props, slots }) =>
      h(
        AsyncElmList,
        {
          listStyle: props?.listStyle === 'unordered' ? 'unordered' : 'ordered'
        },
        render(slots.default)
      ),
    BlockQuote: ({ props, slots }) =>
      h(AsyncElmBlockQuote, { cite: props?.cite }, render(slots.default)),
    Callout: ({ props, slots }) =>
      h(AsyncElmCallout, { type: props?.type }, render(slots.default)),
    Divider: ({}) => h(AsyncElmDivider, {}),
    Toggle: ({ slots }) =>
      h(
        AsyncElmToggle,
        {},
        {
          default: render(slots.default),
          summary: render(slots.summary)
        }
      ),
    Bookmark: ({ props }) =>
      h(AsyncElmBookmark, {
        url: props.url,
        title: props.title,
        description: props.description,
        image: props.image
      }),
    File: ({ props }) => h(AsyncElmFile, { src: props.src, name: props.name }),
    Image: ({ props }) =>
      h(AsyncElmBlockImage, {
        src: props.src,
        alt: props.alt,
        enableModal: true
      }),
    CodeBlock: ({ props, slots }) =>
      h(
        AsyncElmCodeBlock,
        { code: props.code, language: props.language },
        render(slots.default)
      ),
    Katex: ({ props }) =>
      h(AsyncElmKatex, { expression: props.expression, block: true }),
    Table: ({ slots }) =>
      h(
        AsyncElmTable,
        {},
        {
          body: h(AsyncElmTableBody, {}, render(slots.body)),
          header:
            slots.header != null
              ? h(AsyncElmTableHeader, {}, render(slots.header))
              : undefined
        }
      ),
    TableRow: ({ slots }) => h(AsyncElmTableRow, {}, render(slots.default)),
    TableCell: ({ slots }) => h(AsyncElmTableCell, {}, render(slots.default))
  }
}

const render = (jsonComponents: Component[]): VNode[] => {
  const results: VNode[] = []

  for (const component of jsonComponents) {
    const renderFunction = defaultRenderFunctionMap(render)[component.type]
    results.push(renderFunction(component as any))
  }

  return results
}

const renderResult = render(props.jsonComponents)
</script>

<style module lang="scss"></style>
