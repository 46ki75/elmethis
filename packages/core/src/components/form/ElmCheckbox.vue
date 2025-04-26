<template>
  <div
    :class="[
      $style.container,
      {
        [$style['container--disable']]: props.disable
      }
    ]"
    @click="toggleCheck"
  >
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }"
    >
      <svg width="24" height="24" :class="$style.checkbox">
        <circle
          cx="0"
          cy="0"
          r="2"
          :class="$style.loading"
          :style="{ opacity: props.loading ? 1 : 0 }"
        >
          <animate
            attributeName="cx"
            values="4; 20; 20; 4; 4"
            dur="1.2s"
            repeatCount="indefinite"
            keySplines="0.25 0.1 0.25 1; 0.42 0 0.58 1; 0.25 0.1 0.25 1; 0.42 0 0.58 1"
            calcMode="spline"
          />
          <animate
            attributeName="cy"
            values="4; 4; 20; 20; 4"
            dur="1.2s"
            repeatCount="indefinite"
            keySplines="0.25 0.1 0.25 1; 0.42 0 0.58 1; 0.25 0.1 0.25 1; 0.42 0 0.58 1"
            calcMode="spline"
          />
        </circle>

        <circle
          cx="20"
          cy="20"
          r="2"
          :class="$style.loading"
          :style="{ opacity: props.loading ? 1 : 0 }"
        >
          <animate
            attributeName="cx"
            values="20; 4; 4; 20; 20"
            dur="1.2s"
            repeatCount="indefinite"
            keySplines="0.25 0.1 0.25 1; 0.42 0 0.58 1; 0.25 0.1 0.25 1; 0.42 0 0.58 1"
            calcMode="spline"
          />
          <animate
            attributeName="cy"
            values="20; 20; 4; 4; 20"
            dur="1.2s"
            repeatCount="indefinite"
            keySplines="0.25 0.1 0.25 1; 0.42 0 0.58 1; 0.25 0.1 0.25 1; 0.42 0 0.58 1"
            calcMode="spline"
          />
        </circle>

        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          :class="[
            $style.rect,
            {
              [$style['rect--checked']]: isChecked,
              [$style['rect--loading']]: props.loading
            }
          ]"
          strokeWidth="0.8"
        />

        <polyline
          v-if="isChecked"
          :class="$style['check-line']"
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
import ElmInlineText from '../typography/ElmInlineText.vue'

export interface ElmCheckboxProps {
  /**
   * The label displayed.
   */
  label: string

  /**
   * Whether the checkbox is in a loading state.
   */
  loading?: boolean

  /**
   * Whether the checkbox is disabled.
   */
  disable?: boolean
}

const props = withDefaults(defineProps<ElmCheckboxProps>(), {
  loading: false
})

const isChecked = defineModel<boolean>({})

function toggleCheck() {
  if (!props.loading && !props.disable) {
    isChecked.value = !isChecked.value
  }
}
</script>

<style module lang="scss">
// # --------------------------------------------------------------------------------
//
// styles
//
// # --------------------------------------------------------------------------------

.container {
  width: fit-content;
  font-family: sans-serif;
  user-select: none;
  cursor: pointer;

  transition: opacity 200ms;

  &:hover {
    opacity: 0.8;
  }

  &--disable {
    opacity: 0.45;
    cursor: not-allowed;

    &:hover {
      opacity: 0.45;
    }
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

  &--loading {
    opacity: 0.3;
  }

  &--checked {
    fill: rgba(0, 0, 0, 0.8);
    [data-theme='dark'] & {
      fill: rgba(255, 255, 255, 0.8);
    }
  }
}

.loading {
  transition: opacity 200ms;

  fill: rgba(black, 0.7);
  [data-theme='dark'] & {
    fill: rgba(white, 0.7);
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

  animation-name: elmethis-checkbox-check-line;
  animation-duration: 0.2s;
  animation-timing-function: ease-in-out;
  animation-delay: 0.1s;
  animation-fill-mode: both;

  transform-origin: center;

  stroke: rgba(255, 255, 255, 0.9);
  [data-theme='dark'] & {
    stroke: rgba(0, 0, 0, 0.9);
  }
}
</style>
