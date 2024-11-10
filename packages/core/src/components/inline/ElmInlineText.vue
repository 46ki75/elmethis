<template>
  <component :is="render()"></component>
</template>

<script setup lang="ts">
import type { Property } from 'csstype'
import { h, useCssModule } from 'vue'

export interface ElmInlineTextProps {
  /**
   * The text to display.
   */
  text: string

  /**
   * Specifies the color of the text.
   *
   * e.g.) `'red'`, `'#ff0000'`, `'rgba(255, 0, 0, 0.5)'`
   */
  color?: Property.Color

  /**
   * Specifies the font size of the text.
   */
  size?: Property.FontSize

  /**
   * Specifies whether the text should be bold.
   */
  bold?: boolean

  /**
   * Specifies whether the text should be italic.
   */
  italic?: boolean

  /**
   * Specifies whether the text should be underlined.
   */
  underline?: boolean

  /**
   * Specifies whether the text should be strikethrough.
   */
  strikethrough?: boolean

  code?: boolean

  background?: Property.BackgroundColor
}

const props = withDefaults(defineProps<ElmInlineTextProps>(), {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  code: false
})

const style = useCssModule()

const render = () => {
  let vnode = h(
    'span',
    {
      class: style.text,
      style: {
        '--color': props.color,
        '--font-size': props.size,
        '--background-color': props.background
      }
    },
    props.text
  )

  if (props.strikethrough) {
    vnode = h('del', {}, vnode)
  }

  if (props.italic) {
    vnode = h('em', {}, vnode)
  }

  if (props.underline) {
    vnode = h('ins', {}, vnode)
  }

  if (props.bold) {
    vnode = h('strong', {}, vnode)
  }

  return vnode
}
</script>

<style module lang="scss">
.text {
  color: var(--color, rgba(black, 0.7));
  font-size: var(--font-size);
  line-height: var(--font-size);
  background-color: var(--background-color);

  &::selection {
    color: rgba(white, 0.7);
    background-color: var(--color, rgba(black, 0.7));
  }

  [data-theme='dark'] & {
    color: var(--color, rgba(white, 0.7));

    &::selection {
      color: rgba(black, 0.7);
      background-color: var(--color, rgba(white, 0.7));
    }
  }
}
</style>
