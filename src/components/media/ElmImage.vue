<template>
  <div class="fallback" v-if="isLoading">
    <elm-rectangle-wave />
    <div>
      <elm-dot-loading-icon />
    </div>
  </div>

  <img
    class="image"
    :src="src"
    :alt="alt"
    @load="
      () => {
        isLoading = false
      }
    "
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
      '--cursor': enableModal ? 'zoom-in' : 'auto'
    }"
  />

  <transition>
    <div class="modal" v-if="isModalOpen">
      <img
        class="modal-image"
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
import { onKeyStroke } from '@vueuse/core'

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
}

withDefaults(defineProps<ElmImageProps>(), {
  enableModal: false
})

const isLoading = ref(true)
const isModalOpen = ref(false)

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  isModalOpen.value = false
})
</script>

<style scoped lang="scss">
.image {
  width: 100%;
  height: var(--height);
  opacity: var(--opacity);
  transition: opacity 400ms;
  cursor: var(--cursor);
}

.fallback {
  margin: 0;
  padding: 0;
  position: relative;
  width: 100%;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  aspect-ratio: 16 / 9;
}

.modal {
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
