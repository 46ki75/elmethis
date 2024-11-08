<template>
  <div
    :class="[
      $style.arrow,
      {
        [$style.normal]: !loading && !pending,
        [$style.loading]: loading,
        [$style.pending]: !loading && pending
      }
    ]"
    :style="{
      '--size': size,
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
import type { Property } from 'csstype'

export interface ElmArrowIconProps {
  /**
   * Specifies the direction of the arrow.
   */
  direction?: 'up' | 'down' | 'left' | 'right'

  /**
   * Specifies whether the arrow is in loading state.
   */
  loading?: boolean

  /**
   * Specifies whether the arrow is in pending state.
   */
  pending?: boolean

  /**
   * Specifies the size of the arrow.
   */
  size?: Property.Height
}

withDefaults(defineProps<ElmArrowIconProps>(), {
  direction: 'right',
  loading: false,
  pending: false,
  size: '2rem'
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
  width: var(--size);
  height: var(--size);
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
  transition: background 400ms;
  [data-theme='dark'] & {
    background: rgba(white, 0.7);
  }
}

.pending {
  background: rgba(black, 0.2);
  transition: background 400ms;
  [data-theme='dark'] & {
    background: rgba(white, 0.2);
  }
}
</style>
