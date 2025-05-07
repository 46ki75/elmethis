<template>
  <div
    v-if="props.block"
    ref="targetRef"
    :class="[$style.katex, textStyle.text]"
    :style="{
      '--margin-block': props.block ? '3rem' : undefined,
    }"
  >
    <span v-if="html" v-html="html"></span>
  </div>

  <span
    v-else
    ref="targetRef"
    :class="$style.katex"
    :style="{
      '--margin-block': props.block ? '3rem' : undefined,
    }"
  >
    <span v-if="html" v-html="html"></span
  ></span>
</template>

<script setup lang="ts">
import { onMounted, onServerPrefetch, onUpdated, ref } from "vue";

import textStyle from "../../styles/text.module.scss";

export interface ElmKatexProps {
  /**
   * The KaTex expression.
   */
  expression: string;

  /**
   * Whether to render the equation in block mode.
   * - If `true`, the equation will be rendered in block mode.
   * - If `false`, the equation will be rendered in inline mode.
   *
   * Default is `false`.
   */
  block?: boolean;
}

const props = withDefaults(defineProps<ElmKatexProps>(), {
  block: false,
});

const html = ref<string | undefined>();

let katexRenderToString:
  | ((
      expression: string,
      options: { displayMode: boolean; output: "mathml" }
    ) => string)
  | null = null;

const loadKatex = async () => {
  if (!katexRenderToString) {
    const { renderToString } = await import("katex");
    katexRenderToString = renderToString;
  }
};

const render = async () => {
  await loadKatex();

  if (html.value == null && katexRenderToString) {
    try {
      html.value = katexRenderToString(props.expression, {
        displayMode: props.block,
        output: "mathml",
      });
    } catch (err) {
      console.error("KaTeX rendering error:", err);
    }
  }
};

onMounted(render);
onUpdated(render);
onServerPrefetch(render);
</script>

<style module lang="scss">
.katex {
  margin-block: var(--margin-block);
}
</style>
