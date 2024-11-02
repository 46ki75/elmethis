<template>
  <div
    class="parallax"
    :style="{
      backgroundImage: `url(${imageUrl1})`,
      transform: `scale(1.2) translateY(${y / 400}%)`,
      transformOrigin: 'bottom'
    }"
  ></div>
  <div
    class="parallax"
    :style="{
      backgroundImage: `url(${imageUrl2})`,
      transform: `scale(1.2) translateY(${y / 900}%)`,
      transformOrigin: 'bottom'
    }"
  ></div>
</template>

<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

export interface ElmParallaxProps {
  imageUrl1: string
  imageUrl2: string
}

withDefaults(defineProps<ElmParallaxProps>(), {})

const { y } = useWindowScroll()
</script>

<style scoped lang="scss">
.parallax {
  position: fixed;
  height: 2000vh;
  width: 100%;
  top: 0;
  left: 0;
  z-index: -1;
  background-repeat: repeat;
  background-size: auto;

  opacity: 0.2;
  [data-theme='dark'] & {
    opacity: 0.1;
  }
}
</style>
