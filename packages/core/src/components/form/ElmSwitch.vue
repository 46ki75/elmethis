<template>
  <div
    @click="checked = !checked"
    :style="{
      '--color': color,
      '--padding': '2px',
      '--size': size,
      '--width': 'calc(var(--size) * 2 + var(--padding) * 2)'
    }"
  >
    <input :class="[$style.switch]" type="checkbox" :checked="checked" />
    <div :class="[$style.bar, { [$style['bar--checked']]: checked }]">
      <div
        :class="[$style.circle, { [$style['circle--checked']]: checked }]"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Property } from 'csstype'

export interface ElmSwitchProps {
  color: string
  size: Property.Width
}

withDefaults(defineProps<ElmSwitchProps>(), {
  color: '#6987b8',
  size: '18px'
})

const checked = defineModel({ default: false })
</script>

<style module lang="scss">
.switch {
  display: none;
}

.bar {
  z-index: 0;
  padding: var(--padding);
  width: var(--width);
  height: var(--size);
  border-radius: calc((var(--size) + var(--padding)) / 2);
  position: relative;
  cursor: pointer;
  box-shadow: 0 0 2px rgba(black, 0.1);

  transition:
    opacity 300ms,
    background-color 300ms;
  background-color: rgba(gray, 0.25);

  &--checked {
    background-color: var(--color);
  }
}

.circle {
  z-index: 1;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  position: absolute;
  top: var(--padding);
  left: var(--padding);
  transition:
    transform 300ms,
    opacity 300ms,
    background-color 300ms;
  background-color: white;

  &--checked {
    transform: translateX(calc(var(--width) - var(--size)));
  }

  &:hover {
    opacity: 0.8;
  }
}
</style>
