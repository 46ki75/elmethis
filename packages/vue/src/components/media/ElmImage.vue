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
    </transition>

    <div
      :class="$style['image-frame']"
      :style="{
        '--margin-block': margin,
      }"
    >
      <transition
        mode="out-in"
        :enter-from-class="fadeStyle['fade-enter-from']"
        :enter-active-class="fadeStyle['fade-enter-active']"
        :enter-to-class="fadeStyle['fade-fast-enter-to']"
        :leave-from-class="fadeStyle['fade-fast-leave-from']"
        :leave-active-class="fadeStyle['fade-fast-leave-active']"
        :leave-to-class="fadeStyle['fade-fast-leave-to']"
      >
        <div
          v-if="isLoading"
          :class="$style.fallback"
          :style="{
            'aspect-ratio':
              width && height ? `${width} / ${height}` : '1200 / 630',
            width: width && `${width}px`,
            height: height && `${height}px`,
          }"
        >
          <elm-rectangle-wave />
          <div>
            <elm-dot-loading-icon />
          </div>
        </div>
      </transition>

      <img
        :class="block ? $style['image-block'] : $style['image-inline']"
        :src="src"
        :alt="alt"
        :width="width"
        :height="height"
        @click="if (enableModal) isModalOpen = true;"
        :style="{
          '--margin-block': margin,
          '--width': width && `${width}px`,
          '--height': width && `${height}px`,
          cursor: enableModal ? 'zoom-in' : undefined,
          opacity: !isLoading && !error ? 1 : 0,
          pointerEvents: !isLoading && !error ? undefined : 'none',
        }"
      />
    </div>

    <transition
      mode="out-in"
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
      mode="out-in"
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
        <img
          :class="$style['modal-image']"
          :src="src"
          :alt="alt"
          :width="width"
          :height="height"
        />
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

  width?: number;

  height?: number;
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
  opacity: var(--opacity);
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

.image-frame {
  position: relative;
  width: 100%;
  display: grid;
  place-items: center;
  transition: opacity 200ms;
}

.fallback {
  max-width: 100%;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  grid-area: 1 / 1;
}

%image {
  display: block;
  grid-area: 1 / 1;
  transition: opacity 200ms ease 100ms;
  z-index: 0;
  width: clamp(auto, var(--width, auto), 100%);
  height: clamp(auto, var(--height, auto), 100vh);
}

.image-inline {
  @extend %image;

  margin-block: var(--margin-block, 0);
}

.image-block {
  @extend %image;

  border-radius: 0.25rem;
  box-shadow: 0 0 0.125rem rgba(black, 0.3);
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
