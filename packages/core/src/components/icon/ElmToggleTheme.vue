<template>
  <component
    :class="$style.icon"
    :is="isDarkTheme ? MoonIcon : SunIcon"
    :style="{ width: size, height: size }"
    @click="toggleTheme"
  />
</template>

<script setup lang="ts">
import { MoonIcon, SunIcon } from '@heroicons/vue/24/outline'
import type { Property } from 'csstype'
import { useElmethisTheme } from '../../hooks/useElmethisTheme'

export interface ElmToggleThemeProps {
  /**
   * Specifies the size of the dot.
   */
  size?: Property.Width<string | number>
}

withDefaults(defineProps<ElmToggleThemeProps>(), {
  size: '2rem'
})

const { isDarkTheme, toggleTheme } = useElmethisTheme()
</script>

<style module lang="scss">
@mixin icon($color) {
  box-sizing: border-box;
  padding: 0.25rem;
  color: $color;
  border-radius: 50%;
  box-shadow: 0 0 0.125rem rgba(128, 128, 128, 0.6);
  cursor: pointer;
}

.icon {
  @include icon(rgba(0, 0, 0, 0.8));
  [data-theme='dark'] & {
    @include icon(rgba(255, 255, 255, 0.8));
  }
}
</style>
