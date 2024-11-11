<template>
  <div :class="$style['snackbar-screen']">
    <div :class="$style['snackbar-container']">
      <TransitionGroup name="fade">
        <ElmSnackbar
          v-for="snackbar in snackbars"
          :key="snackbar.id"
          :close="snackbar.close"
        >
          {{ snackbar.label }}
        </ElmSnackbar>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import ElmSnackbar from './ElmSnackbar.vue'

export interface ElmSnackbarContainerProps {
  snackbars: {
    id: string
    label: string
    timeout?: number
    close: () => void
  }[]
}

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
.fade-enter-active,
.fade-leave-active {
  transition: all 300ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
