<template>
  <transition mode="out-in">
    <div v-if="status === 'pending'" :class="$style.wrapper">
      <ElmMdiIcon :d="mdiReload" color="#6987b8" size="1em" />
      <ElmInlineText :text="message" color="#6987b8" />
    </div>

    <div v-else-if="status === 'error'" :class="$style.wrapper">
      <ElmMdiIcon :d="mdiAlertCircle" color="#c56565" size="1em" />
      <ElmInlineText :text="message" color="#c56565" />
    </div>

    <div v-else-if="status === 'warning'" :class="$style.wrapper">
      <ElmMdiIcon :d="mdiAlert" color="#cdb57b" size="1em" />
      <ElmInlineText :text="message" color="#cdb57b" />
    </div>

    <div v-else :class="$style.wrapper">
      <ElmMdiIcon :d="mdiCheckCircle" color="#59b57c" size="1em" />
      <ElmInlineText :text="message" color="#59b57c" />
    </div>
  </transition>
</template>

<script setup lang="ts">
import ElmInlineText from "../typography/ElmInlineText.vue";

import ElmMdiIcon from "../icon/ElmMdiIcon.vue";
import { mdiReload, mdiAlertCircle, mdiCheckCircle, mdiAlert } from "@mdi/js";

export interface ElmStatusMessageProps {
  status: "success" | "error" | "warning" | "pending";
  message: string;
}

withDefaults(defineProps<ElmStatusMessageProps>(), {});
</script>

<style module lang="scss">
.wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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
