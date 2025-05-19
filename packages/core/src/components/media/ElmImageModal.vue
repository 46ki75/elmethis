<template>
  <div :class="$style.modal">
    <img :class="$style.image" :src="src" :alt="alt" />
  </div>
</template>

<script setup lang="ts">
export interface ElmImageModalProps {
  /**
   * Image source URL
   */
  src: string;

  /**
   * Image alt text
   */
  alt?: string;
}

withDefaults(defineProps<ElmImageModalProps>(), {});
</script>

<style module lang="scss">
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

.image {
  display: block;
  max-width: 100%;
}
</style>
