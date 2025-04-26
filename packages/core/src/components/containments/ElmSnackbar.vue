<template>
  <div :class="$style.snackbar">
    <ElmInlineText v-if="props.label != null" :text="props.label" />
    <component v-else :is="() => props.children" />
    <Icon icon="mdi:cross-circle-outline" :class="$style.icon" @click="close" />
    <div
      :class="$style.progress"
      :style="{
        animationDuration: `${timeout}ms`
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { VNode } from 'vue'
import ElmInlineText from '../typography/ElmInlineText.vue'

export interface ElmSnackbarProps {
  label?: string
  children?: VNode
  timeout?: number
  close: () => void
}

const props = withDefaults(defineProps<ElmSnackbarProps>(), {
  timeout: 5000
})
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
  transition: background-color 200ms;

  color: rgba(black, 0.75);
  [data-theme='dark'] & {
    color: rgba(white, 0.75);
  }

  &:hover {
    background-color: rgba(black, 0.1);
    [data-theme='dark'] & {
      background-color: rgba(white, 0.1);
    }
  }
}

@keyframes progress {
  0% {
    transform: scaleX(1);
    transform-origin: left;
  }
  100% {
    transform: scaleX(0);
    transform-origin: left;
  }
}

.progress {
  position: absolute;
  width: 100%;
  height: 3px;
  bottom: 0;
  left: 0;
  background-color: #6987b8;
  animation-name: progress;
  animation-iteration-count: 1;
  animation-fill-mode: both;
  animation-timing-function: linear;
}
</style>
