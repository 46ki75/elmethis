<template>
  <div :class="$style.container">
    <template v-for="color in colors">
      <div :class="$style['row-container']">
        <div :class="$style['color-name']" :style="{ '--color': color.code }">
          {{ color.name }}
        </div>
        <template
          v-for="darkness in [
            -3, -0.25, -0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2, 0.25,
            0.3,
          ]"
        >
          <ElmColorSample :color="darken(darkness, color.code)" />
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { darken } from "polished";
import ElmColorSample from "./ElmColorSample.vue";

export interface ElmColorTableProps {
  /**
   * The colors to display.
   */
  colors: { name: string; code: string }[];
}

withDefaults(defineProps<ElmColorTableProps>(), {});
</script>

<style module lang="scss">
.container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0.25rem;

  .row-container {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: row;
    gap: 0.25rem;

    .color-name {
      width: 6rem;
      color: var(--color);

      &::selection {
        background-color: var(--color);
        color: white;
      }
    }
  }
}
</style>
