<template>
  <img
    class="image"
    :src="src"
    :alt="alt"
    @load="
      () => {
        isLoading = false
      }
    "
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
}
</style>
