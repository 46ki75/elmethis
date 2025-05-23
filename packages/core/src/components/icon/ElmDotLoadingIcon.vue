<template>
  <div :class="$style.wrapper" :style="{ width: size, height: size }">
    <div
      :class="$style.dot"
      v-for="n in 3"
      aria-hidden
      :key="n"
      :style="{ backgroundColor: color }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { Property } from "csstype";

export interface ElmDotLoadingIconProps {
  /**
   * Specifies the color of the dot.
   *
   * e.g.) `'red'`, `'#ff0000'`, `'rgba(255, 0, 0, 0.5)'`
   */
  color?: Property.BackgroundColor;

  /**
   * Specifies the size of the dot.
   */
  size?: Property.Width<string | number>;
}

withDefaults(defineProps<ElmDotLoadingIconProps>(), {
  color: undefined,
  size: "64px",
});
</script>

<style module lang="scss">
@keyframes bounce {
  0% {
    transform: translateY(0%) scaleY(0.3) scaleX(1.5);
  }

  10% {
    transform: scaleY(0.8) scaleX(1.2);
  }

  100% {
    transform: translateY(-400%) scaleY(1.1);
  }
}

.wrapper {
  position: relative;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;

  .dot {
    width: 20%;
    height: 20%;
    border-radius: 50%;
    animation-name: bounce;
    animation-duration: 0.4s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-timing-function: ease-out;

    transition: background-color 400ms;
    background-color: #606875;

    [data-theme="dark"] & {
      background-color: #b0b5be;
    }

    &:nth-last-of-type(1) {
      animation-delay: -100ms;
    }

    &:nth-last-of-type(2) {
      animation-delay: 0ms;
    }

    &:nth-last-of-type(3) {
      animation-delay: 100ms;
    }
  }
}
</style>
