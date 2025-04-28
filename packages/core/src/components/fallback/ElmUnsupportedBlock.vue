<template>
  <div :class="$style.unsupported">
    <div :class="$style.message">
      <svg
        viewBox="0 0 24 24"
        width="1.25rem"
        height="1.25rem"
        :class="$style.icon"
      >
        <path :d="mdiInformation" />
      </svg>
      <ElmInlineText text="UNSUPPORTED BLOCK" color="#868e9c" />
    </div>
    <div v-if="details" :class="$style.details">
      <ElmInlineText :text="details" color="#868e9c" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiInformation } from "@mdi/js";
import ElmInlineText from "../typography/ElmInlineText.vue";

export interface ElmUnsupportedBlockProps {
  details?: string;
}

withDefaults(defineProps<ElmUnsupportedBlockProps>(), {});
</script>

<style module lang="scss">
.unsupported {
  box-sizing: border-box;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  border: 1px dashed rgba(#868e9c, 0.5);
}

.message {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.icon {
  fill: #868e9c;
}

.details {
  opacity: 0.75;
}
</style>
