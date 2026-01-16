<template>
  <ElmTooltip v-if="href && ogp">
    <template #original>
      <component :is="renderLink()" />
    </template>
    <template #tooltip>
      <div v-if="ogp" :class="$style.ogp">
        <div :class="$style['ogp-text']">
          <div :class="[textStyle.text, $style['ogp-title']]">
            {{ ogp.title }}
          </div>
          <div
            v-if="ogp.description"
            :class="[textStyle.text, $style['ogp-description']]"
          >
            {{ ogp.description }}
          </div>
        </div>
        <ElmImage v-if="ogp.image" :src="ogp.image" />
      </div>
      <ElmInlineText v-else :text="href" />
    </template>
  </ElmTooltip>

  <component v-else-if="href" :is="renderLink()" />

  <component v-else :is="render()"></component>
</template>

<script setup lang="ts">
import type { Property } from "csstype";
import { getLuminance } from "polished";
import { h, useCssModule, VNodeChild } from "vue";
import ElmInlineIcon from "../icon/ElmInlineIcon.vue";
import ElmMdiIcon from "../icon/ElmMdiIcon.vue";
import { mdiOpenInNew } from "@mdi/js";

// CSS Modules
import textStyle from "../../styles/text.module.scss";
import ElmTooltip from "../containments/ElmTooltip.vue";
import ElmImage from "../media/ElmImage.vue";

export interface ElmInlineTextProps {
  /**
   * The text to display.
   */
  text?: string;

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

  kbd?: boolean;

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

  ogp?: {
    title: string;
    description?: string;
    image?: string;
  };
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

const slots = defineSlots<{
  default?: () => VNodeChild;
}>();

const renderLink = () => {
  const children: VNodeChild[] = [];

  if (props.favicon) {
    children.push(h(ElmInlineIcon, { src: props.favicon, alt: "favicon" }));
  }

  if (slots.default) {
    children.push(h(slots.default));
  } else {
    children.push(h("span", {}, props.text ?? props.href));
  }

  children.push(
    h(ElmMdiIcon, {
      d: mdiOpenInNew,
      size: "0.8em",
      color: "gray",
      style: { opacity: 0.75 },
    })
  );

  return h(
    "a",
    {
      class: style.link,
      href: props.href,
      style: { "--font-size": props.size },
      target: "_blank",
      rel: "noopener noreferrer",
    },
    children
  );
};

const render = () => {
  const backgroundColor =
    props.backgroundColor != null
      ? getLuminance(props.backgroundColor) < 0.5
        ? "rgba(255, 255, 255, 0.7)"
        : "rgba(0, 0, 0, 0.7)"
      : undefined;

  let vnode = slots.default
    ? h(
        "span",
        {
          class: [style.text, textStyle.text],
          style: {
            "--color": props.color ?? backgroundColor,
            "--font-size": props.size,
            "--background-color": props.backgroundColor,
          },
        },
        { default: slots.default }
      )
    : h(
        "span",
        {
          class: [style.text, textStyle.text],
          style: {
            "--color": props.color ?? backgroundColor,
            "--font-size": props.size,
            "--background-color": props.backgroundColor,
          },
        },
        props.text
      );

  if (props.kbd) {
    vnode = h("kbd", { class: style.kbd }, vnode);
  }

  if (props.strikethrough) {
    vnode = h(
      "del",
      {
        class: style.del,
        style: {
          "--color": props.color ?? backgroundColor,
        },
      },
      vnode
    );
  }

  if (props.italic) {
    vnode = h(
      "em",
      {
        class: style.em,
        style: {
          "--color": props.color ?? backgroundColor,
        },
      },
      vnode
    );
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
  font-size: var(--font-size, 1em);
  line-height: var(--font-size, 1em);
  background-color: var(--background-color);
  transition: color 200ms;
}

.del {
  text-decoration-color: var(--color);
}

.em {
  text-decoration-color: var(--color);
}

.code {
  margin-inline: 0.25rem;
  padding: 2px 0.5em;
  font-size: calc(1em - 2px);
  border-radius: 0.125rem;
  background-color: rgba(0, 0, 0, 0.075);
  font-family: "Source Code Pro" monospace;
}

.kbd {
  padding: 0.125rem 0.25rem;
  position: relative;
  border-radius: 0.125rem;
  background-color: #e6e6e6;

  [data-theme="dark"] & {
    background-color: #404040;
  }

  &::before {
    z-index: -1;
    position: absolute;
    content: "";
    bottom: -0.25em;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: #ccc;
    border-radius: 0 0 0.125rem 0.125rem;
    box-shadow: 0 0 0.125em rgba(black, 0.5);

    [data-theme="dark"] & {
      background-color: #595959;
      box-shadow: 0 0 0.125em rgba(white, 0.5);
    }
  }
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
  border-radius: 0.125rem;
  transition:
    background-color 200ms,
    color 200ms,
    opacity 200ms;

  &:hover {
    background-color: rgba($color: #6987b8, $alpha: 0.2);
  }

  &:active {
    opacity: 0.5;
  }

  &:visited {
    color: #9771bd;
    border-bottom: dashed 1px #9771bd;

    &:hover {
      background-color: rgba($color: #9771bd, $alpha: 0.2);
    }
  }
}

.ogp {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;

  border-radius: 0.25rem;
  box-shadow: 0 0 0.125rem rgba(black, 0.3);

  background-color: rgba(white, 0.8);

  [data-theme="dark"] & {
    background-color: rgba(white, 0.1);
  }
}

.ogp-text {
  box-sizing: border-box;
  padding: 0.5rem;
}

.ogp-title {
  box-sizing: border-box;
  font-weight: bold;
  padding-block-end: 0.25rem;
}

.ogp-description {
  opacity: 0.7;
  padding: 0.25rem;
}
</style>
