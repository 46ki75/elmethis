<template>
  <ElmTooltip>
    <template #original>
      <component
        class="icon"
        :style="{
          '--width': size,
          '--color': isLogin ? '#b36472' : '#6987b8'
        }"
        :is="
          isLoading
            ? h(ElmDotLoadingIcon, { size: size })
            : isLogin
              ? ArrowRightStartOnRectangleIcon
              : ArrowRightEndOnRectangleIcon
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
import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon
} from '@heroicons/vue/24/outline'
import ElmTooltip from '../containments/ElmTooltip.vue'
import ElmInlineText from '../inline/ElmInlineText.vue'
import ElmDotLoadingIcon from './ElmDotLoadingIcon.vue'
import { h } from 'vue'

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

<style scoped lang="scss">
.icon {
  box-sizing: border-box;
  width: var(--width);
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
