<template>
  <component :is="render()"></component>
</template>

<script setup lang="ts">
import type { Property } from 'csstype'
import { getLuminance } from 'polished'
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

  /**
   * Specifies whether the text should be displayed as code.
   */
  code?: boolean

  /**
   * Specifies the background color of the text.
   */
  backgroundColor?: Property.BackgroundColor
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
  const backgroundColor =
    props.backgroundColor != null
      ? getLuminance(props.backgroundColor) < 0.5
        ? 'rgba(255, 255, 255, 0.7)'
        : 'rgba(0, 0, 0, 0.7)'
      : undefined

  let vnode = h(
    'span',
    {
      class: style.text,
      style: {
        '--color': props.color ?? backgroundColor,
        '--font-size': props.size,
        '--background-color': props.backgroundColor
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

  if (props.code) {
    vnode = h('code', { class: style.code }, vnode)
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

.code {
  margin-inline: 0.25rem;
  padding: 0.25em 0.5em;
  border-radius: 0.125rem;
  background-color: rgba(0, 0, 0, 0.075);
}
</style>
