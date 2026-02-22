<template>
  <nav
    :class="[$style.wrapper, { [$style['wrapper--visible']]: isVisible }]"
    :style="{
      '--size': `${64}px`,
      left: position === 'left' ? '0' : 'auto',
      right: position === 'right' ? '0' : 'auto',
    }"
    @click="toTop"
  >
    <div aria-hidden :class="$style.partial"></div>
    <div aria-hidden :class="$style.partial"></div>
    <div aria-hidden :class="$style.partial"></div>
    <span :class="[$style.text, textStyle.text]">Back to Top</span>
  </nav>
</template>

<script setup lang="ts">
import { useWindowScroll } from "@vueuse/core";
import { ref, watch } from "vue";

import textStyle from "../../styles/text.module.scss";

export interface ElmPagetopProps {
  /**
   * Specifies the position of the button.
   */
  position?: "left" | "right";
}

withDefaults(defineProps<ElmPagetopProps>(), {
  position: "right",
});

const isVisible = ref<boolean>(false);

const { y } = useWindowScroll();

watch(
  () => y.value,
  () => {
    isVisible.value = y.value > 100;
  },
);

const toTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
</script>

<style module lang="scss">
.wrapper {
  --const-margin: 1rem;

  z-index: 50;
  -webkit-tap-highlight-color: transparent;

  display: block;
  position: fixed;
  bottom: 0;
  margin: var(--const-margin) 0.5rem;
  width: var(--size);
  height: var(--size);
  left: var(--left, auto);
  right: var(---right, auto);
  opacity: 1;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition:
    transform 700ms,
    opacity 400ms;
  transform-origin: 50% 50%;

  transform: translateY(250%) rotate(180deg);

  &--visible {
    transition:
      transform 700ms,
      opacity 200ms;
    transform: translateY(0%) rotate(0deg);
  }

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.4;
  }

  @keyframes move {
    0% {
      opacity: 0;
      transform: translateY(600%);
    }
    25% {
      opacity: 1;
      transform: translateY(220%);
    }
    42% {
      opacity: 1;
      transform: translateY(200%);
    }
    67% {
      opacity: 1;
      transform: translateY(0%);
    }
    100% {
      opacity: 0;
      transform: translateY(-50%) scale(0.5);
    }
  }

  .partial {
    position: absolute;
    width: var(--size);
    height: 20px;
    opacity: 0;
    transform: scale3d(0.5, 0.5, 0.5);
    animation: move 3000ms ease-out infinite;

    &:nth-of-type(1) {
      animation: move 3000ms ease-out 1000ms infinite;
    }

    &:nth-of-type(2) {
      animation: move 3000ms ease-out 2000ms infinite;
    }

    &:before,
    &:after {
      content: "";
      position: absolute;
      top: 0;
      height: 100%;
      width: 50%;
      background-color: #494f59;
      [data-theme="dark"] & {
        background-color: #bec2ca;
      }
    }

    &:before {
      left: 0;
      transform: skew(0deg, -30deg);
    }

    &:after {
      right: 0;
      transform: skew(0deg, 30deg);
    }
  }

  .text {
    transition: opacity 200ms ease 400ms;
    width: 100%;
    text-align: center;
    font-family: sans-serif;
    position: absolute;
    z-index: 50;
    bottom: calc(0px - var(--const-margin));
    font-size: 12px;
    white-space: nowrap;
    user-select: none;
  }
}
</style>
