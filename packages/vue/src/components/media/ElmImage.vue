<template>
  <div :class="$style.wrapper" ref="target">
    <transition
      mode="out-in"
      :enter-from-class="fadeStyle['fade-enter-from']"
      :enter-active-class="fadeStyle['fade-enter-active']"
      :enter-to-class="fadeStyle['fade-fast-enter-to']"
      :leave-from-class="fadeStyle['fade-fast-leave-from']"
      :leave-active-class="fadeStyle['fade-fast-leave-active']"
      :leave-to-class="fadeStyle['fade-fast-leave-to']"
    >
      <div v-if="error" :class="$style.error">
        <ElmInlineText
          text="Error loading image"
          color="#c56565"
          size="1.5rem"
        />
      </div>

      <div
        :class="$style.fallback"
        v-else-if="isLoading"
        :style="{ '--margin-block': margin }"
      >
        <elm-rectangle-wave />
        <div>
          <elm-dot-loading-icon />
        </div>
      </div>

      <img
        v-else
        :class="block ? $style['image-block'] : $style.image"
        :src="src"
        :alt="alt"
        @click="if (enableModal) isModalOpen = true;"
        :style="{
          '--cursor': enableModal ? 'zoom-in' : undefined,
          '--margin-block': margin,
        }"
      />
    </transition>

    <transition
      :enter-from-class="fadeStyle['fade-enter-from']"
      :enter-active-class="fadeStyle['fade-enter-active']"
      :enter-to-class="fadeStyle['fade-enter-to']"
      :leave-from-class="fadeStyle['fade-leave-from']"
      :leave-active-class="fadeStyle['fade-leave-active']"
      :leave-to-class="fadeStyle['fade-leave-to']"
    >
      <div
        v-if="block && !isLoading && alt != null && alt.trim() !== ''"
        :class="$style['alt-container']"
      >
        <ElmMdiIcon
          :d="mdiMessageImageOutline"
          color="#6987b8"
          style="flex-shrink: 0"
        />
        <div :class="$style['alt-text']">
          <ElmInlineText :text="alt" size="0.8rem" />
        </div>
      </div>
    </transition>

    <transition
      :enter-from-class="fadeStyle['fade-enter-from']"
      :enter-active-class="fadeStyle['fade-enter-active']"
      :enter-to-class="fadeStyle['fade-enter-to']"
      :leave-from-class="fadeStyle['fade-leave-from']"
      :leave-active-class="fadeStyle['fade-leave-active']"
      :leave-to-class="fadeStyle['fade-leave-to']"
    >
      <div
        v-if="isModalOpen"
        :class="$style.modal"
        @click="isModalOpen = false"
      >
        <img :class="$style['modal-image']" :src="src" :alt="alt" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { Property } from "csstype";

import { ref } from "vue";
import ElmRectangleWave from "../fallback/ElmRectangleWave.vue";
import ElmDotLoadingIcon from "../icon/ElmDotLoadingIcon.vue";
import { onKeyStroke, useImage, useIntersectionObserver } from "@vueuse/core";
import ElmInlineText from "../typography/ElmInlineText.vue";

import fadeStyle from "../../styles/transition-fade.module.scss";

import { mdiMessageImageOutline } from "@mdi/js";
import ElmMdiIcon from "../icon/ElmMdiIcon.vue";

export interface ElmImageProps {
  /**
   * Image source URL
   */
  src: string;

  /**
   * Image alt text
   */
  alt?: string;

  block?: boolean;

  /**
   * Enable modal on image click. Default: `false`
   */
  enableModal?: boolean;

  /**
   * The margin of the image.
   */
  margin?: Property.MarginBlock;
}

const props = withDefaults(defineProps<ElmImageProps>(), {
  block: false,
  enableModal: false,
});

const { isLoading, error } = useImage({ src: props.src });

const isModalOpen = ref(false);

onKeyStroke("Escape", (e) => {
  e.preventDefault();
  isModalOpen.value = false;
});

const target = ref(null);
const targetIsVisible = ref(false);

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  if (props.block) targetIsVisible.value = isIntersecting;
});
</script>

<style module lang="scss">
.wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: var(--opacity);
  transition: opacity 400ms;
}

.image {
  display: block;
  margin-block: var(--margin-block);
  max-width: 100%;
  max-height: 100vh;
  cursor: var(--cursor);
}

.error {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  width: 100%;
  height: 100%;
  min-height: 10rem;
  line-height: 1.5rem;
  color: #c56565;
}

.fallback {
  margin-block: var(--margin-block);
  margin: 0;
  padding: 0;
  position: relative;
  width: 100%;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1200 / 630;
}

.image-block {
  overflow: hidden;
  border-radius: 0.25rem;
  box-shadow: 0 0 0.125rem rgba(black, 0.3);
  display: block;
  max-width: 100%;
  max-height: 100vh;
  cursor: var(--cursor);
}

.alt-container {
  max-width: 80%;
  margin: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  color: #6987b8;
  opacity: 0.8;
}

.modal {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(#23262a, 0.8);
  cursor: zoom-out;
}

.modal-image {
  display: block;
  max-width: 100%;
  cursor: zoom-out;
}
</style>
