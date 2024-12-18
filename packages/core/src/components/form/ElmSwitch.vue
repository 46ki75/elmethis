<template>
  <div
    @click="handleClick"
    :style="{
      '--color': color,
      '--padding': '2px',
      '--size': size,
      '--width': 'calc(var(--size) * 2 + var(--padding) * 2)'
    }"
  >
    <input
      :class="[$style.switch]"
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
    />
    <div
      :class="[
        $style.bar,
        {
          [$style['bar--checked']]: checked,
          [$style['bar--disabled']]: disabled
        }
      ]"
    >
      <div
        :class="[
          $style.circle,
          {
            [$style['circle--checked']]: checked,
            [$style['circle--disabled']]: disabled
          }
        ]"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Property } from 'csstype'

export interface ElmSwitchProps {
  /**
   * The color of the switch when checked.
   */
  color: string

  /**
   * The size of the switch.
   */
  size: Property.Width

  /**
   * Whether the switch is disabled.
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<ElmSwitchProps>(), {
  color: '#6987b8',
  size: '18px',
  disabled: false
})

const checked = defineModel({ default: false })

const handleClick = () => {
  if (!props.disabled) checked.value = !checked.value
}
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

  &--disabled {
    cursor: not-allowed;
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
  background-color: rgba(white, 0.9);

  &--checked {
    transform: translateX(calc(var(--width) - var(--size)));
  }

  &--disabled {
    opacity: 0.5;
    background-color: gray;
  }

  &:hover {
    opacity: 0.8;
  }
}
</style>
