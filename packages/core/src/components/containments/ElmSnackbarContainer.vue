<template>
  <div :class="$style['snackbar-screen']">
    <div :class="$style['snackbar-container']">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ElmSnackbarContainerProps {}

withDefaults(defineProps<ElmSnackbarContainerProps>(), {})
</script>

<style module lang="scss">
.snackbar-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  pointer-events: none;
}

.snackbar-container {
  margin: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
}
</style>
