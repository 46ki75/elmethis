<template>
  <div>
    <header :class="$style.header">
      <img :src="viteIcon" alt="User Icon" :class="$style.icon" />
      <ElmInlineText :text="message?.name ?? 'User'" bold />
    </header>
    <div>
      <ElmMarkdown :markdown="message.content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from "@ag-ui/core";
import viteIcon from "../../../assets/vite.svg";
import ElmInlineText from "../../typography/ElmInlineText.vue";
import ElmMarkdown from "../../others/ElmMarkdown.vue";

export interface ElmAgUiMessageSystemProps {
  message: Extract<Message, { role: "user" }>;
}

withDefaults(defineProps<ElmAgUiMessageSystemProps>(), {});
</script>

<style module lang="scss">
.header {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  justify-content: flex-start;
  align-items: center;
}

.icon {
  height: 1.5rem;
}
</style>
