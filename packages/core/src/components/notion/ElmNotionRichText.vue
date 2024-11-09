<template>
  <template v-for="t in richText">
    <ElmInlineCode v-if="t.annotations.code" :code="t.plain_text" />
    <ElmInlineText :text="t.plain_text" :bold="t.annotations.bold" />
  </template>
</template>

<script setup lang="ts">
import ElmInlineText from '../inline/ElmInlineText.vue'
import ElmInlineCode from '../inline/ElmInlineCode.vue'

export interface ElmNotionRichTextProps {
  richText:
    | Array<{
        type: 'text'
        text: {
          content: string
          link: {
            url: string
          } | null
        }
        annotations: {
          bold: boolean
          italic: boolean
          strikethrough: boolean
          underline: boolean
          code: boolean
          color:
            | 'default'
            | 'gray'
            | 'brown'
            | 'orange'
            | 'yellow'
            | 'green'
            | 'blue'
            | 'purple'
            | 'pink'
            | 'red'
            | 'gray_background'
            | 'brown_background'
            | 'orange_background'
            | 'yellow_background'
            | 'green_background'
            | 'blue_background'
            | 'purple_background'
            | 'pink_background'
            | 'red_background'
        }
        plain_text: string
        href: string | null
      }>
    | any[]
}

withDefaults(defineProps<ElmNotionRichTextProps>(), {})
</script>
