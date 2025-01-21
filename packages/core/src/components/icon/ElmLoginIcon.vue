<template>
  <ElmTooltip>
    <template #original>
      <Icon
        :class="$style.icon"
        :style="{
          '--width': size,
          '--color': isLoading ? 'gray' : isLogin ? '#b36472' : '#6987b8'
        }"
        :icon="
          isLoading
            ? 'svg-spinners:ring-resize'
            : isLogin
              ? 'mdi:logout-variant'
              : 'mdi:login-variant'
        "
      />
    </template>
    <template #tooltip>
      <ElmInlineText
        :text="isLoading ? 'Loading...' : isLogin ? 'Logout' : 'Login'"
      />
    </template>
  </ElmTooltip>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import ElmTooltip from '../containments/ElmTooltip.vue'
import ElmInlineText from '../inline/ElmInlineText.vue'

export interface ElmLoginIconProps {
  /**
   * Specifies the width of the icon.
   */
  size?: string

  /**
   * Specifies whether the icon is for login or logout.
   */
  isLogin?: boolean

  /**
   * Specifies whether the icon is loading.
   */
  isLoading?: boolean
}

withDefaults(defineProps<ElmLoginIconProps>(), {
  size: '2rem'
})
</script>

<style module lang="scss">
.icon {
  box-sizing: border-box;
  width: var(--width);
  height: var(--width);
  padding: 0.25rem;
  border-radius: 0.25rem;
  color: var(--color);
  cursor: pointer;

  transition: background-color 200ms;
  &:hover {
    background-color: rgba(black, 0.1);
    [data-theme='dark'] & {
      background-color: rgba(white, 0.1);
    }
  }
}
</style>
