<template>
  <ElmTooltip>
    <template #original>
      <slot />
    </template>
    <template #tooltip>
      <div :class="[$style.container, headingStyle.heading]">
        <div v-if="title" :class="$style.title">
          {{ title }}
        </div>

        <div :class="[$style.text, textStyle.text]">
          {{ text }}
        </div>
      </div>
    </template>
  </ElmTooltip>
</template>

<script setup lang="ts">
import ElmTooltip from "./ElmTooltip.vue";

import headingStyle from "../../styles/heading.module.scss";
import textStyle from "../../styles/text.module.scss";

export interface ElmTemplateProps {
  title?: string;
  text: string;
}

withDefaults(defineProps<ElmTemplateProps>(), {});
</script>

<style module lang="scss">
.container {
  box-sizing: border-box;
  padding: 0.5rem;

  border-radius: 0.25rem;
  box-shadow: 0 0 0.125rem rgba(0, 0, 0, 0.2);

  color: rgba(0, 0, 0, 0.7);
  background-color: rgba(255, 255, 255, 0.9);

  transform-origin: top;

  [data-theme="dark"] & {
    color: rgba(255, 255, 255, 0.7);
    background-color: rgba(0, 0, 0, 0.9);
  }
}

.title {
  box-sizing: border-box;
  padding-bottom: 0.25rem;
  font-weight: bold;
}

.text {
  opacity: 0.9;
}
</style>
