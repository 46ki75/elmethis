<template>
  <span
    :class="$style.text"
    :style="{
      '--color': color,
      '--font-size': size,
      '--font-weight': bold ? 'bold' : undefined,
      '--font-style': italic ? 'italic' : undefined,
      '--text-decoration':
        underline && strikethrough
          ? 'underline line-through'
          : underline
            ? 'underline'
            : strikethrough
              ? 'line-through'
              : undefined
    }"
    >{{ text }}</span
  >
</template>

<script setup lang="ts">
import type { Property } from 'csstype'

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
  color?: Property.BackgroundColor

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
}

withDefaults(defineProps<ElmInlineTextProps>(), {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false
})
</script>

<style module lang="scss">
.text {
  color: var(--color, rgba(0, 0, 0, 0.7));
  font-size: var(--font-size);
  font-weight: var(--font-weight);
  font-style: var(--font-style);
  text-decoration: var(--text-decoration);

  &::selection {
    color: rgba(255, 255, 255, 0.7);
    background-color: var(--color, rgba(0, 0, 0, 0.7));
  }

  [data-theme='dark'] & {
    color: var(--color, rgba(255, 255, 255, 0.7));

    &::selection {
      color: rgba(0, 0, 0, 0.7);
      background-color: var(--color, rgba(255, 255, 255, 0.7));
    }
  }
}
</style>
