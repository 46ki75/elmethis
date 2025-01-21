<template>
  <transition mode="out-in">
    <div v-if="status === 'pending'" :class="$style.wrapper">
      <Icon
        icon="mdi:rotate-clockwise"
        :class="$style.icon"
        :style="{ color: '#6987b8' }"
      />
      <ElmInlineText :text="message" color="#6987b8" />
    </div>

    <div v-else-if="status === 'error'" :class="$style.wrapper">
      <Icon
        icon="uis:exclamation-circle"
        :class="$style.icon"
        :style="{ color: '#c56565' }"
      />
      <ElmInlineText :text="message" color="#c56565" />
    </div>

    <div v-else-if="status === 'warning'" :class="$style.wrapper">
      <Icon
        icon="ic:baseline-warning"
        :class="$style.icon"
        :style="{ color: '#cdb57b' }"
      />
      <ElmInlineText :text="message" color="#cdb57b" />
    </div>

    <div v-else :class="$style.wrapper">
      <Icon
        icon="material-symbols-light:check-circle"
        :class="$style.icon"
        :style="{ color: '#59b57c' }"
      />
      <ElmInlineText :text="message" color="#59b57c" />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import ElmInlineText from '../inline/ElmInlineText.vue'

export interface ElmStatusMessageProps {
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
}

withDefaults(defineProps<ElmStatusMessageProps>(), {})
</script>

<style module lang="scss">
.wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  width: 20px;
  height: 20px;
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
