<template>
  <div :class="$style['snackbar-screen']">
    <div :class="$style['snackbar-container']">
      <transition><slot /></transition>
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
  gap: 0.5rem;
}
</style>

<style scoped lang="scss">
.v-enter-to,
.v-leave-from {
  opacity: 1;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 200ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
