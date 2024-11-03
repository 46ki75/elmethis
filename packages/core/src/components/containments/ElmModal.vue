<template>
  <div class="provider">
    <div
      class="modal"
      :style="{
        '--width': width
      }"
    >
      <slot />
    </div>
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
</script>

<style scoped lang="scss">
.provider {
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
</style>
