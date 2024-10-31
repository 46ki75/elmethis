<template>
  <div class="container" @click="toggleCheck">
    <div
      :style="{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }"
    >
      <svg width="24" height="24" :class="['checkbox']">
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          :class="['rect', { 'rect--checked': isChecked }]"
          strokeWidth="0.8"
        />

        <polyline
          v-if="isChecked"
          class="check-line"
          points="5,12 10,17 19,8"
          strokeWidth="1.5"
          fill="transparent"
        />

        <line x1="0" y1="1" x2="4" y2="1" strokeWidth="2" fill="transparent" />

        <line x1="4" y1="0" x2="24" y2="0" strokeWidth="1" fill="transparent" />

        <line x1="0" y1="4" x2="0" y2="16" strokeWidth="1" fill="transparent" />

        <line
          x1="0"
          y1="18"
          x2="0"
          y2="20"
          strokeWidth="1"
          fill="transparent"
        />

        <line
          x1="0"
          y1="24"
          x2="20"
          y2="24"
          strokeWidth="1"
          fill="transparent"
        />

        <line
          x1="20"
          y1="23"
          x2="24"
          y2="23"
          strokeWidth="1.5"
          fill="transparent"
        />

        <line
          x1="24"
          y1="4"
          x2="24"
          y2="20"
          :style="{ strokeWidth: 1 }"
          fill="transparent"
        />
      </svg>
      <elm-inline-text :text="label" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ElmInlineText from '../inline/ElmInlineText.vue'

export interface ElmCheckboxProps {
  /**
   * The label displayed.
   */
  label: string
}

withDefaults(defineProps<ElmCheckboxProps>(), {})

const isChecked = defineModel<boolean>('isChecked')

function toggleCheck() {
  isChecked.value = !isChecked.value
}
</script>

<style scoped lang="scss">
// # --------------------------------------------------------------------------------
//
// styles
//
// # --------------------------------------------------------------------------------

.container {
  width: fit-content;
  font-family: sans-serif;
  user-select: none;

  transition: opacity 200ms;

  &:hover {
    opacity: 0.8;
  }
}

.checkbox {
  stroke: rgba(0, 0, 0, 0.8);
  fill: transparent;

  [data-theme='dark'] & {
    stroke: rgba(255, 255, 255, 0.8);
  }
}

.rect {
  transition: all 0.2s;

  &--checked {
    fill: rgba(0, 0, 0, 0.8);
    [data-theme='dark'] & {
      fill: rgba(255, 255, 255, 0.8);
    }
  }
}

@keyframes elmethis-checkbox-check-line {
  0% {
    stroke-dashoffset: 100%;
  }
  100% {
    stroke-dashoffset: 0%;
  }
}

.check-line {
  stroke-dasharray: 100%;
  animation: elmethis-checkbox-check-line 0.2s ease-in-out 0.1s both;
  transform-origin: center;

  stroke: rgba(255, 255, 255, 0.9);
  [data-theme='dark'] & {
    stroke: rgba(0, 0, 0, 0.9);
  }
}
</style>
