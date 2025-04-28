<template>
  <div :class="$style['elmethis-block-fallback']">
    <ElmDotLoadingIcon />
  </div>
</template>

<script setup lang="ts">
import ElmDotLoadingIcon from "../icon/ElmDotLoadingIcon.vue";

export interface ElmBlockFallbackProps {}

withDefaults(defineProps<ElmBlockFallbackProps>(), {});
</script>

<style module lang="scss">
.elmethis-block-fallback {
  width: 100%;
  height: 8rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
