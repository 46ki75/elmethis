<template>
  <div :class="$style.wrapper">
    <div :class="$style.heaeer">
      <Icon :icon="icon" :class="$style.icon" />
      <ElmInlineText :text="text" />
    </div>
    <div :class="$style.container"><slot /></div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import ElmInlineText from "../typography/ElmInlineText.vue";

export interface ElmChildContainerProps {
  icon: string;
  text: string;
}

withDefaults(defineProps<ElmChildContainerProps>(), {});
</script>

<style module lang="scss">
.wrapper {
  border-radius: 0.25rem;
  border: solid 1px rgba(gray, 0.2);
}

.heaeer {
  padding: 0 0.25rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(gray, 0.2);
}

.icon {
  width: 1rem;
  height: 1rem;
  line-height: 1rem;
  color: rgba(black, 0.7);
  [data-theme="dark"] & {
    color: rgba(white, 0.7);
  }
}

.container {
  padding: 0 0.75rem;
}
</style>
