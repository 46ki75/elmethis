<template>
  <div :style="{ '--color': color }">
    <ElmTooltip>
      <template #original>
        <div
          class="color-bg"
          :style="{
            '--background-color': color
          }"
        ></div>
        <div class="text">{{ rgbToColorString(parseToRgb(color)) }}</div>
      </template>
      <template #tooltip>
        <div class="text">{{ rgbToColorString(parseToRgb(color)) }}</div>
        <div class="text">{{ `rgb(${red}, ${green}, ${blue})` }}</div>
        <div class="text">
          {{
            `hsl(${Math.floor(hue)}, ${Math.floor(saturation * 100)}%, ${Math.floor(lightness * 100)}%)`
          }}
        </div>
      </template>
    </ElmTooltip>
  </div>
</template>

<script setup lang="ts">
import { parseToHsl, parseToRgb, rgbToColorString } from 'polished'
import ElmTooltip from '../containments/ElmTooltip.vue'

export interface ElmColorSampleProps {
  color: string
}

const props = withDefaults(defineProps<ElmColorSampleProps>(), {})

const { blue, green, red } = parseToRgb(props.color)
const { hue, saturation, lightness } = parseToHsl(props.color)
</script>

<style scoped lang="scss">
.color-bg {
  width: 5rem;
  height: 2rem;
  border-radius: 0.25rem;
  background-color: var(--background-color);
  cursor: pointer;

  transition: opacity 100ms;

  &:active {
    opacity: 0.5;
  }
}

.text {
  padding: 0.125rem;
  border-radius: 0.125rem;
  transition:
    color 100ms,
    background-color 100ms,
    opacity 100ms;
  color: var(--color);
  cursor: pointer;

  &:hover {
    color: white;
    background-color: var(--color);
  }

  &:active {
    opacity: 0.5;
  }

  &::selection {
    color: white;
    background-color: var(--color);
  }
}
</style>
