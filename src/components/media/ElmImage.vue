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
    :style="{
      '--height': isLoading ? '0' : 'auto',
      '--opacity': isLoading ? 0 : 1
    }"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ElmRectangleWave from '../fallback/ElmRectangleWave.vue'
import ElmDotLoadingIcon from '../icon/ElmDotLoadingIcon.vue'

withDefaults(
  defineProps<{
    /**
     * Image source URL
     */
    src: string

    /**
     * Image alt text
     */
    alt?: string
  }>(),
  {}
)

const isLoading = ref(true)
</script>

<style scoped lang="scss">
.image {
  width: 100%;
  height: var(--height);
  opacity: var(--opacity);
  transition: opacity 400ms;
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
</style>
