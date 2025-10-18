<template>
  <div
    :class="$style.wrapper"
    :style="{
      '--size': size,
      '--dimensions': dimensions,
      '--duration': `${DURATION}ms`,
    }"
  >
    <template v-for="(_, rowIndex) in new Array<null>(dimensions).fill(null)">
      <div
        v-for="(_, columnIndex) in new Array<null>(dimensions).fill(null)"
        :class="$style.square"
        :style="{ '--delay': `${DELAY * (rowIndex + columnIndex)}ms` }"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { type Property } from "csstype";

export interface ElmSquareLoadingIconProps {
  size?: Property.Width;
  dimensions?: number;
}

const props = withDefaults(defineProps<ElmSquareLoadingIconProps>(), {
  size: "3rem",
  dimensions: 4,
});

const DURATION = 1200;
const DELAY = DURATION / (props.dimensions * 3);
</script>

<style module lang="scss">
@keyframes appear {
  0% {
    transform: scale(0);
  }

  20% {
    transform: scale(0);
  }

  80% {
    transform: scale(1);
  }

  100% {
    transform: scale(1);
  }
}

.wrapper {
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(var(--dimensions), auto);
  grid-template-rows: repeat(var(--dimensions), auto);
  justify-content: start;
}

.square {
  width: calc(var(--size) / var(--dimensions));
  height: calc(var(--size) / var(--dimensions));

  animation-name: appear;
  animation-iteration-count: infinite;
  animation-fill-mode: both;
  animation-direction: alternate;
  animation-duration: var(--duration);
  animation-delay: var(--delay);

  background-color: #606875;

  [data-theme="dark"] & {
    background-color: #b0b5be;
  }
}
</style>
