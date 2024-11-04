<template>
  <div :style="{ '--color': color }">
    <ElmTooltip>
      <template #original>
        <div
          :class="$style['color-bg']"
          :style="{
            '--background-color': color
          }"
          @click="copy(hex)"
        >
          <transition>
            <CheckIcon
              v-if="copied"
              :style="{ width: '16px', color: 'white' }"
            />
          </transition>
        </div>
        <div :class="$style.text" @click="copy(hex)">{{ hex }}</div>
      </template>
      <template #tooltip>
        <div :class="$style.text" @click="copy(hex)">{{ hex }}</div>
        <div :class="$style.text" @click="copy(rgb)">{{ rgb }}</div>
        <div :class="$style.text" @click="copy(hsl)">{{ hsl }}</div>
      </template>
    </ElmTooltip>
  </div>
</template>

<script setup lang="ts">
import { parseToHsl, parseToRgb, rgbToColorString } from 'polished'
import ElmTooltip from '../containments/ElmTooltip.vue'
import { useClipboard } from '@vueuse/core'
import { CheckIcon } from '@heroicons/vue/24/outline'

export interface ElmColorSampleProps {
  /**
   * The color to display.
   */
  color: string
}

const props = withDefaults(defineProps<ElmColorSampleProps>(), {})

const { blue, green, red } = parseToRgb(props.color)
const { hue, saturation, lightness } = parseToHsl(props.color)

const hex = rgbToColorString(parseToRgb(props.color))
const rgb = `rgb(${red}, ${green}, ${blue})`
const hsl = `hsl(${Math.floor(hue)}, ${Math.floor(saturation * 100)}%, ${Math.floor(lightness * 100)}%)`

const { copy, copied } = useClipboard()
</script>

<style module lang="scss">
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
  margin-block: 0.125rem;
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

<style scoped lang="scss">
.v-enter-to,
.v-leave-from {
  opacity: 1;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 300ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
