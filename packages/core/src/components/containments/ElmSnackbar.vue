<template>
  <div :class="$style.snackbar">
    <div><slot /></div>
    <XMarkIcon :class="$style.icon" @click="handleClose" />
    <div
      :class="$style.progress"
      :style="{
        transform:
          timeout === 0 ? undefined : `scaleX(${(timeout - remain) / timeout})`,
        transformOrigin: 'left'
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

export interface ElmSnackbarProps {
  timeout?: number
  remain?: number
}

withDefaults(defineProps<ElmSnackbarProps>(), {
  timeout: 5000,
  remain: 5000
})

const isShown = defineModel({ default: true })

const handleClose = () => {
  isShown.value = false
}
</script>

<style module lang="scss">
.snackbar {
  position: relative;
  display: inline-flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  pointer-events: all;
  border-radius: 0.25rem;
  box-shadow: 0 0 0.25rem rgba(black, 0.25);
  background-color: rgba(white, 0.5);
  [data-theme='dark'] & {
    box-shadow: 0 0 0.25rem rgba(black, 0.5);
    background-color: rgba(black, 0.2);
  }
}

.icon {
  padding: 0.25rem;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  transition: background-color 100ms;

  &:hover {
    background-color: rgba(black, 0.1);
    [data-theme='dark'] & {
      background-color: rgba(white, 0.1);
    }
  }
}

.progress {
  position: absolute;
  width: 100%;
  height: 3px;
  bottom: 0;
  left: 0;
  background-color: #6987b8;
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
