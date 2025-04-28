<template>
  <Icon
    v-if="!isDarkTheme"
    icon="line-md:moon-to-sunny-outline-loop-transition"
    :class="$style.icon"
    :width="size"
    @click="toggleTheme"
  />
  <Icon
    v-else
    icon="line-md:sunny-outline-to-moon-loop-transition"
    :class="$style.icon"
    :width="size"
    @click="toggleTheme"
  />
</template>

<script setup lang="ts">
import type { Property } from "csstype";
import { useElmethisTheme } from "../../hooks/useElmethisTheme";
import { Icon } from "@iconify/vue";

export interface ElmToggleThemeProps {
  /**
   * Specifies the size of the dot.
   */
  size?: Property.Width<string | number>;
}

withDefaults(defineProps<ElmToggleThemeProps>(), {
  size: "2rem",
});

const { isDarkTheme, toggleTheme } = useElmethisTheme();
</script>

<style module lang="scss">
@mixin icon($color) {
  box-sizing: border-box;
  padding: 0.25rem;
  color: $color;
  border-radius: 50%;
  cursor: pointer;
}

.icon {
  @include icon(rgba(0, 0, 0, 0.8));
  box-shadow: 0 0 0.125rem rgba(black, 0.3);
  background-color: rgba(white, 0.2);
  [data-theme="dark"] & {
    box-shadow: 0 0 0.125rem rgba(black, 0.6);
    background-color: rgba(black, 0.2);
    @include icon(rgba(255, 255, 255, 0.8));
  }
}
</style>
