<template>
  <div :class="$style.container">
    <transition mode="out-in">
      <div v-if="error" :class="$style.error">
        <ElmInlineText
          text="Error loading image"
          color="#c56565"
          size="1.5rem"
        />
      </div>

      <div :class="$style.fallback" v-else-if="isLoading">
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
            isModalOpen = true
          }
        "
        :style="{
          '--height': isLoading ? '0' : 'auto',
          '--opacity': isLoading ? 0 : 1,
          display: isLoading ? 'none' : 'block'
        }"
      />
    </transition>
  </div>

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
import ElmInlineText from '../inline/ElmInlineText.vue'

export interface ElmBlockImageProps {
  /**
   * Image source URL
   */
  src: string

  /**
   * Image alt text
   */
  alt?: string
}

const props = withDefaults(defineProps<ElmBlockImageProps>(), {})

const { isLoading, error } = useImage({ src: props.src })

const isModalOpen = ref(false)

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  isModalOpen.value = false
})
</script>

<style module lang="scss">
.container{
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image {
  overflow: hidden;
  border-radius: 0.25rem;
  box-shadow: 0 0 0.25rem rgba(black, 0.3);
  display: block;
  max-width: 100%;
  height: var(--height);
  opacity: var(--opacity);
  transition: opacity 400ms;
  cursor: zoom-in;
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
  margin-block: 1rem;
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
