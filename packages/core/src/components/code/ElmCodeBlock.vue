<template>
  <div
    ref="target"
    :class="$style.wrapper"
    :style="{
      '--margin-block': margin,
      '--opacity': targetIsVisible ? 1 : 0,
    }"
  >
    <div :class="$style.header">
      <div :class="$style.header__left">
        <ElmLanguageIcon :language="language" :size="20" />
        <span :class="$style.caption">
          <component :is="() => renderCaption()" />
        </span>
      </div>

      <div ref="tooltipRef" :class="$style.header__right">
        <ElmMdiIcon
          size="1.25em"
          :d="
            copied
              ? mdiClipboardCheckMultipleOutline
              : mdiClipboardMultipleOutline
          "
          :class="$style['copy-icon']"
          @click="
            () => {
              copy(code);
            }
          "
          :icon="
            copied
              ? 'mdi:clipboard-check-multiple-outline'
              : 'mdi:clipboard-multiple-outline'
          "
        />

        <transition>
          <div v-if="copied" :class="$style.tooltip">
            <ElmMdiIcon
              size="1.25em"
              :d="mdiClipboardCheckMultipleOutline"
              :class="$style['tooltip-check-icon']"
              color="#449763"
            />
            <ElmInlineText text="Copied to Clipboard!" />
          </div>

          <div v-else-if="isHovered && !copied" :class="$style.tooltip">
            <ElmMdiIcon
              size="1.25em"
              :d="mdiClipboardMultipleOutline"
              :class="$style['tooltip-check-icon']"
              color="#4c6da2"
            />
            <ElmInlineText text="Copy to Clipboard" />
          </div>
        </transition>
      </div>
    </div>

    <div :class="$style.code">
      <div
        :class="$style['code-body']"
        :style="{ opacity: isRendered ? 1 : 0 }"
      >
        <AsyncElmShikiHighlighter
          v-model="isRendered"
          :code="code"
          :language="language"
        />
      </div>

      <div :style="{ opacity: !isRendered ? 1 : 0 }" :class="$style.fallback">
        <ElmDotLoadingIcon size="48px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ElmLanguageIcon from "../icon/ElmLanguageIcon.vue";
import ElmInlineText from "../typography/ElmInlineText.vue";
import ElmBlockFallback from "../fallback/ElmBlockFallback.vue";
import ElmDotLoadingIcon from "../icon/ElmDotLoadingIcon.vue";

import {
  useClipboard,
  useIntersectionObserver,
  useElementHover,
} from "@vueuse/core";

import type { Property } from "csstype";
import {
  defineAsyncComponent,
  h,
  ref,
  defineSlots,
  useTemplateRef,
  VNode,
} from "vue";

import {
  mdiClipboardMultipleOutline,
  mdiClipboardCheckMultipleOutline,
} from "@mdi/js";
import ElmMdiIcon from "../icon/ElmMdiIcon.vue";

export interface ElmCodeBlockProps {
  /**
   * The code to display.
   */
  code: string;

  /**
   * The language of the code.
   */
  language?: string;

  /**
   * The caption of the code block.
   * If not provided, the language will be used.
   */
  caption?: string;

  /**
   * The margin of the code block.
   */
  margin?: Property.MarginBlock;
}

const props = withDefaults(defineProps<ElmCodeBlockProps>(), {
  language: "txt",
});

const AsyncElmShikiHighlighter = defineAsyncComponent({
  loader: () => import("./ElmShikiHighlighter.vue"),
  loadingComponent: ElmBlockFallback,
});

const isRendered = ref(false);

const { copy, copied } = useClipboard({ source: props.code });

const target = ref(null);
const targetIsVisible = ref(false);

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  targetIsVisible.value = isIntersecting;
});

const tooltipElement = useTemplateRef<HTMLButtonElement>("tooltipRef");
const isHovered = useElementHover(tooltipElement);

const slots = defineSlots<{
  default?: () => VNode[];
}>();

const renderCaption = (): VNode | VNode[] => {
  if (props.caption) {
    return h(ElmInlineText, { text: props.caption });
  } else if (slots.default != null) {
    return slots.default();
  } else {
    return h(ElmInlineText, { text: props.language });
  }
};
</script>

<style module lang="scss">
.wrapper {
  margin-block: var(--margin-block);
  opacity: var(--opacity);
  display: flex;
  flex-direction: column;
  border-radius: 0.25rem;

  transition:
    background-color 400ms,
    opacity 800ms;

  background-color: rgba(white, 0.4);
  box-shadow: 0 0 0.125rem rgba(#3e434b, 0.3);
  [data-theme="dark"] & {
    background-color: rgba(#2c3037, 0.9);
    box-shadow: 0 0 0.125rem rgba(black, 0.4);
  }
}

.header {
  box-sizing: border-box;
  width: calc(100% - 1rem);
  padding: 0.25rem 0.5rem 0.5rem 0.5rem;
  margin: 0.5rem;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  font-family: "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace;

  border-bottom: solid 1px rgba(#3e434b, 0.3);
  [data-theme="dark"] & {
    border-color: rgba(#bec2ca, 0.3);
  }
}

.header__left {
  width: calc(100% - 2rem);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.caption {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.copy-icon {
  box-sizing: border-box;
  padding: 0.125rem;
  width: 26px;
  height: 26px;
  border-radius: 0.125rem;
  cursor: pointer;

  transition: background-color 200ms;

  color: rgba(black, 0.7);

  [data-theme="dark"] & {
    color: rgba(white, 0.7);
  }

  &:hover {
    background-color: rgba(black, 0.1);
    [data-theme="dark"] & {
      background-color: rgba(white, 0.1);
    }
  }
}

.header__right {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.code {
  position: relative;
  padding: 0.25rem 1rem 1rem 1rem;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(#6987b8, 0.3) rgba(#6987b8, 0.15);
}

.code-body {
  transition: opacity 200ms;
}

.fallback {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 200ms;
  pointer-events: none;
}

.tooltip {
  position: absolute;
  bottom: -2.5rem;
  right: 0;
  display: flex;
  flex-wrap: none;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  height: 20px;
  white-space: nowrap;
}
</style>

<style scoped lang="scss">
.v-enter-to,
.v-leave-from {
  opacity: 1;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 150ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
