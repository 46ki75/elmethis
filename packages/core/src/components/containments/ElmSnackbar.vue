<template>
  <div :class="$style['snackbar-screen']">
    <div :class="$style['snackbar-container']">
      <transition>
        <div :class="$style.snackbar" v-if="isShown">
          <div><slot /></div>
          <XMarkIcon :class="$style.icon" @click="handleClose" />
          <div
            :class="$style.progress"
            :style="{
              transform:
                timeout === 0
                  ? undefined
                  : `scaleX(${(timeout - remain) / timeout})`,
              transformOrigin: 'left'
            }"
          ></div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { onMounted, ref, watch } from 'vue'

export interface ElmSnackbarProps {
  timeout?: number
}

const props = withDefaults(defineProps<ElmSnackbarProps>(), {
  timeout: 5000
})

const isShown = defineModel({ default: true })
const remain = ref<number>(0)

const timeoutId = ref<number | null>(null)
const intervalId = ref<number | null>(null)

const handleClose = () => {
  isShown.value = false
}

const display = (modalIsShown: boolean) => {
  if (modalIsShown) {
    timeoutId.value = window.setTimeout(() => {
      isShown.value = false
    }, props.timeout)
    remain.value = 0
    intervalId.value = window.setInterval(() => {
      remain.value += 10
    }, 10)
  } else {
    if (timeoutId.value) {
      window.clearTimeout(timeoutId.value)
    }
    if (intervalId.value) {
      window.clearInterval(intervalId.value)
    }
  }
}

watch(isShown, (value) => {
  display(value)
})

onMounted(() => {
  display(isShown.value)
})
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

.snackbar {
  position: relative;
  display: flex;
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
