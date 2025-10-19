<template>
  <div
    :class="$style.validation"
    :style="{
      '--opacity': isValid ? 1 : 0.5,
    }"
  >
    <ElmMdiIcon
      :d="isValid ? mdiCheckCircle : mdiCheckCircleOutline"
      :color="isValid ? validColor : undefined"
    />
    <ElmInlineText :text="text" :color="isValid ? validColor : undefined" />
  </div>
</template>

<script setup lang="ts">
import { mdiCheckCircle, mdiCheckCircleOutline } from "@mdi/js";
import ElmMdiIcon from "../icon/ElmMdiIcon.vue";
import ElmInlineText from "../typography/ElmInlineText.vue";

export interface ElmValidationProps {
  text: string;
  validColor?: string;
  isValid: boolean;
}

withDefaults(defineProps<ElmValidationProps>(), {
  validColor: "#449763",
});
</script>

<style module lang="scss">
.validation {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0.125rem 0;
  gap: 0.5rem;
  opacity: var(--opacity);
  transition: opacity 250ms;
}
</style>
