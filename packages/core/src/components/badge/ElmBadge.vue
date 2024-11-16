<template>
  <span :class="$style.badge" :style="{ '--bg-color': color }">
    <span
      :class="$style.left"
      :style="{
        color:
          getLuminance(color) > 0.5
            ? 'rgba(0,0,0,0.7)'
            : 'rgba(255,255,255,0.7)'
      }"
    >
      <slot name="left" />
    </span>

    <span :class="$style.right">
      <slot name="right" />
    </span>
  </span>
</template>

<script setup lang="ts">
import { getLuminance } from 'polished'

export interface ElmBadgeProps {
  color: string
}

withDefaults(defineProps<ElmBadgeProps>(), {})
</script>

<style module lang="scss">
.badge {
  border: 1px solid var(--bg-color);
  border-radius: 0.25rem;

  .left {
    background-color: var(--bg-color);
    padding-inline: 0.5rem;
  }

  .right {
    padding-inline: 0.5rem;
  }
}
</style>
