<template>
  <a
    v-if="href"
    :class="$style.link"
    :href="href"
    :style="{ '--font-size': size }"
    target="_blank"
    rel="noopener noreferrer"
  >
    <ElmInlineIcon v-if="favicon" :src="favicon" alt="favicon" />

    {{ text ?? href }}
    <ElmMdiIcon
      :d="mdiOpenInNew"
      :size="size ? String(size) : undefined"
      color="gray"
      style="opacity: 0.75"
    />
  </a>

  <component v-else :is="render()"></component>
</template>

<script setup lang="ts">
import type { Property } from "csstype";
import { getLuminance } from "polished";
import { h, useCssModule } from "vue";
import ElmInlineIcon from "../icon/ElmInlineIcon.vue";
import ElmMdiIcon from "../icon/ElmMdiIcon.vue";
import { mdiOpenInNew } from "@mdi/js";

export interface ElmInlineTextProps {
  /**
   * The text to display.
   */
  text: string;

  /**
   * Specifies the color of the text.
   *
   * e.g.) `'red'`, `'#ff0000'`, `'rgba(255, 0, 0, 0.5)'`
   */
  color?: Property.Color;

  /**
   * Specifies the font size of the text.
   */
  size?: Property.FontSize;

  /**
   * Specifies whether the text should be bold.
   */
  bold?: boolean;

  /**
   * Specifies whether the text should be italic.
   */
  italic?: boolean;

  /**
   * Specifies whether the text should be underlined.
   */
  underline?: boolean;

  /**
   * Specifies whether the text should be strikethrough.
   */
  strikethrough?: boolean;

  /**
   * Specifies whether the text should be displayed as code.
   */
  code?: boolean;

  /**
   * Specifies the background color of the text.
   */
  backgroundColor?: Property.BackgroundColor;

  /**
   * The ruby text to display.
   */
  ruby?: string;

  /**
   * The URL to navigate to.
   *
   * e.g. `https://example.com`
   */
  href?: string;

  favicon?: string;
}

const props = withDefaults(defineProps<ElmInlineTextProps>(), {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  code: false,
  size: "1em",
});

const style = useCssModule();

const render = () => {
  const backgroundColor =
    props.backgroundColor != null
      ? getLuminance(props.backgroundColor) < 0.5
        ? "rgba(255, 255, 255, 0.7)"
        : "rgba(0, 0, 0, 0.7)"
      : undefined;

  let vnode = h(
    "span",
    {
      class: style.text,
      style: {
        "--color": props.color ?? backgroundColor,
        "--font-size": props.size,
        "--background-color": props.backgroundColor,
      },
    },
    props.text
  );

  if (props.strikethrough) {
    vnode = h("del", {}, vnode);
  }

  if (props.italic) {
    vnode = h("em", {}, vnode);
  }

  if (props.underline) {
    vnode = h("ins", {}, vnode);
  }

  if (props.bold) {
    vnode = h("strong", {}, vnode);
  }

  if (props.code) {
    vnode = h("code", { class: style.code }, vnode);
  }

  if (props.ruby) {
    vnode = h(
      "ruby",
      {
        class: style.text,
        style: {
          "--color": props.color ?? backgroundColor,
          "--font-size": props.size,
          "--background-color": props.backgroundColor,
        },
      },
      [h("span", {}, vnode), h("rt", {}, props.ruby)]
    );
  }

  return vnode;
};
</script>

<style module lang="scss">
.text {
  padding: 0;
  margin: 0;
  white-space: pre-line;
  color: var(--color, rgba(black, 0.7));
  font-size: var(--font-size, 1em);
  line-height: var(--font-size, 1em);
  background-color: var(--background-color);

  &::selection {
    color: rgba(white, 0.7);
    background-color: var(--color, rgba(black, 0.7));
  }

  [data-theme="dark"] & {
    color: var(--color, rgba(white, 0.7));

    &::selection {
      color: rgba(black, 0.7);
      background-color: var(--color, rgba(white, 0.7));
    }
  }
}

.code {
  margin-inline: 0.25rem;
  padding: 2px 0.5em;
  font-size: calc(1em - 2px);
  border-radius: 0.125rem;
  background-color: rgba(0, 0, 0, 0.075);
  font-family: "Source Code Pro" monospace;
}

.link {
  all: unset;
  box-sizing: border-box;
  padding: 0 0.25rem;
  font-size: var(--font-size);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  color: #6987b8;
  border-radius: 0.125rem 0.125rem 0 0;
  border-bottom: dashed 1px #6987b8;
  transition:
    background-color 200ms,
    color 200ms;

  &:hover {
    background-color: rgba($color: #6987b8, $alpha: 0.2);
  }

  &:active {
    color: #59b57c;
    background-color: rgba($color: #59b57c, $alpha: 0.2);
  }

  &:visited {
    color: #9771bd;
    border-bottom: dashed 1px #9771bd;

    &:hover {
      background-color: rgba($color: #9771bd, $alpha: 0.2);
    }

    &:active {
      color: #59b57c;
      background-color: rgba($color: #59b57c, $alpha: 0.2);
    }
  }
}
</style>
