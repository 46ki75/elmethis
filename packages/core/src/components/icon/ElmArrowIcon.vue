<template>
  <div
    :class="[
      $style.arrow,
      {
        [$style.loading]: loading,
        [$style.normal]: !loading
      }
    ]"
    :style="{
      transform:
        direction === 'up'
          ? 'rotate(270deg)'
          : direction === 'down'
            ? 'rotate(90deg)'
            : direction === 'left'
              ? 'rotate(180deg)'
              : 'rotate(0deg)'
    }"
  ></div>
</template>

<script setup lang="ts">
export interface ElmArrowIconProps {
  direction?: 'up' | 'down' | 'left' | 'right'
  loading?: boolean
}

withDefaults(defineProps<ElmArrowIconProps>(), {
  direction: 'right',
  loading: false
})
</script>

<style module lang="scss">
@keyframes loading {
  0% {
    background-position: 200% 0%;
  }

  33% {
    background-position: 100% 0%;
  }

  66% {
    background-position: 100% 0%;
  }

  100% {
    background-position: 0% 0%;
  }
}

.arrow {
  width: 2rem;
  height: 2rem;
  background: linear-gradient(
    to right,
    rgba(black, 0.7) 0 50%,
    rgba(black, 0.2) 50%
  );
  background-size: 200% 100%;

  clip-path: polygon(
    50% 33%,
    0% 33%,
    0% 66%,
    50% 66%,
    50% 100%,
    100% 50%,
    50% 0%
  );

  [data-theme='dark'] & {
    background: linear-gradient(
      to right,
      rgba(white, 0.7) 0 50%,
      rgba(white, 0.2) 50%
    );
    background-size: 200% 100%;
  }
}

.loading {
  animation-name: loading;
  animation-duration: 1600ms;
  animation-iteration-count: infinite;
}

.normal {
  background: rgba(black, 0.7);
  transition: background 800ms;
  [data-theme='dark'] & {
    background: rgba(white, 0.7);
  }
}
</style>
