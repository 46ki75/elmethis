<template>
  <div
    class="provider"
    :style="{
      '--opacity': isOpen ? 1 : 0,
      '--pointer-events': isOpen ? 'auto' : 'none'
    }"
    @click="isOpen = false"
  >
    <transition>
      <div
        v-if="isOpen"
        class="modal"
        :style="{
          '--width': width
        }"
      >
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { Property } from 'csstype'

export interface ElmModalProps {
  /**
   * The width of the modal.
   * @default '90%'
   */
  width: Property.Width
}

withDefaults(defineProps<ElmModalProps>(), {
  width: '90%'
})

const isOpen = defineModel<boolean>('isOpen', {
  default: true
})
</script>

<style scoped lang="scss">
.provider {
  opacity: var(--opacity, 0);
  pointer-events: var(--pointer-events, none);
  margin: 0;
  padding: 0;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 400ms;

  background-color: rgba(black, 0.7);
  [data-theme='dark'] & {
    background-color: rgba(black, 0.1);
  }

  .modal {
    box-sizing: border-box;
    width: var(--width);
    padding: 0.5rem;
    box-shadow: 0 0 0.25rem rgba(black, 0.4);
    background-color: rgba(233, 233, 233, 0.8);
    box-shadow: 0 0 0.25rem rgba(black, 0.8);
    [data-theme='dark'] & {
      background-color: rgba(22, 22, 22, 0.8);
    }
  }
}

.v-enter-to,
.v-leave-from {
  opacity: 1;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 300ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
