<template>
  <div class="wrapper" :style="{ width: size, height: size }">
    <div
      v-for="n in 3"
      aria-hidden
      :key="n"
      :style="{ backgroundColor: color }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { Property } from 'csstype'

withDefaults(
  defineProps<{
    /**
     * Specifies the color of the dot.
     *
     * e.g.) `'red'`, `'#ff0000'`, `'rgba(255, 0, 0, 0.5)'`
     */
    color?: Property.BackgroundColor

    /**
     * Specifies the size of the dot.
     */
    size?: Property.Width<string | number>
  }>(),
  {
    color: undefined,
    size: '64px'
  }
)
</script>

<style scoped lang="scss">
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

  div {
    width: 20%;
    height: 20%;
    border-radius: 50%;
    animation-name: bounce;
    animation-duration: 0.4s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-timing-function: ease-out;

    transition: background-color 400ms;
    background-color: rgba(0, 0, 0, 0.7);

    [data-theme='dark'] & {
      background-color: rgba(255, 255, 255, 0.7);
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
