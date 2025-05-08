<template>
  <ElmTooltip>
    <template #original>
      <slot />
    </template>
    <template #tooltip>
      <div :class="$style.container">
        <ElmInlineText :text="text" />
      </div>
    </template>
  </ElmTooltip>
</template>

<script setup lang="ts">
import ElmInlineText from "../typography/ElmInlineText.vue";
import ElmTooltip from "./ElmTooltip.vue";

export interface ElmTemplateProps {
  text: string;
}

withDefaults(defineProps<ElmTemplateProps>(), {});
</script>

<style module lang="scss">
.container {
  box-sizing: border-box;
  padding: 0.25rem 0.5rem;

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
</style>
