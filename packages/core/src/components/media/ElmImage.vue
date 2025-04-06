<template>
  <transition mode="out-in">
    <div v-if="error" :class="$style.error">
      <ElmInlineText text="Error loading image" color="#c56565" size="1.5rem" />
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
      :class="$style.image"
      :src="src"
      :alt="alt"
      @click="
        () => {
          if (enableModal) {
            isModalOpen = true
          }
        }
      "
      :style="{
        '--height': isLoading ? '0' : 'auto',
        '--opacity': isLoading ? 0 : 1,
        '--cursor': enableModal ? 'zoom-in' : 'inherit',
        '--margin-block': margin,
        display: isLoading ? 'none' : 'block'
      }"
    />
  </transition>

  <transition>
    <div :class="$style.modal" v-if="isModalOpen">
      <img
        :class="$style['modal-image']"
        :src="src"
        :alt="alt"
        @click="
          () => {
            isModalOpen = false
          }
        "
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ElmRectangleWave from '../fallback/ElmRectangleWave.vue'
import ElmDotLoadingIcon from '../icon/ElmDotLoadingIcon.vue'
import { onKeyStroke, useImage } from '@vueuse/core'
import type { Property } from 'csstype'
import ElmInlineText from '../inline/ElmInlineText.vue'

export interface ElmImageProps {
  /**
   * Image source URL
   */
  src: string

  /**
   * Image alt text
   */
  alt?: string

  /**
   * Enable modal on image click. Default: `false`
   */
  enableModal?: boolean

  /**
   * The margin of the image.
   */
  margin?: Property.MarginBlock
}

const props = withDefaults(defineProps<ElmImageProps>(), {
  enableModal: false
})

const { isLoading, error } = useImage({ src: props.src })

const isModalOpen = ref(false)

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  isModalOpen.value = false
})
</script>

<style module lang="scss">
.image {
  display: block;
  margin-block: var(--margin-block);
  max-width: 100%;
  height: var(--height);
  opacity: var(--opacity);
  transition: opacity 400ms;
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

.modal {
  z-index: 1000;
  position: fixed;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);

  display: flex;
  justify-content: center;
  align-items: center;

  cursor: zoom-out;

  .modal-image {
    width: 100vw;
    height: 100vh;
    object-fit: contain;
  }
}
</style>

<style scoped lang="scss">
.v-enter-to,
.v-leave-from {
  opacity: 1;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 300ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
