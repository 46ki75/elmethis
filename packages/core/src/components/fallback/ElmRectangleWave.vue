<template>
  <div aria-hidden :class="$style['rectangle-wave']"></div>
</template>

<script setup lang="ts">
export interface ElmRectangleWaveProps {}

withDefaults(defineProps<ElmRectangleWaveProps>(), {})
</script>

<style module lang="scss">
@keyframes wave {
  0% {
    transform: scale(0);
    opacity: 0;
  }

  30% {
    opacity: 0;
  }

  40% {
    opacity: 1;
  }

  100% {
    transform: scale(1);
    opacity: 0;
  }
}

.rectangle-wave {
  box-sizing: border-box;
  position: absolute;
  overflow: hidden;

  width: 100%;
  height: 100%;

  animation-name: wave;
  animation-duration: 1200ms;
  animation-iteration-count: infinite;
  animation-fill-mode: both;

  border-style: solid;
  border-width: 1px;
  border-color: rgba(0, 0, 0, 0.7);

  [data-theme='dark'] & {
    border-color: rgba(255, 255, 255, 0.7);
  }
}
</style>
