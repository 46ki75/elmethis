<template>
  <transition
    :leave-from-class="fadeStyle['fade-leave-from']"
    :enter-to-class="fadeStyle['fade-enter-to']"
    :enter-active-class="fadeStyle['fade-enter-active']"
    :leave-active-class="fadeStyle['fade-leave-active']"
    :enter-from-class="fadeStyle['fade-enter-from']"
    :leave-to-class="fadeStyle['fade-leave-to']"
  >
    <div
      v-if="isOpen"
      :class="$style.provider"
      @click="
        () => {
          isOpen = false;
        }
      "
    >
      <div
        :class="$style.modal"
        :style="{
          '--width': width,
        }"
        @click.stop
      >
        <slot />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { VNode } from "vue";
import fadeStyle from "../../styles/transition-fade.module.scss";

export interface ElmModalProps {
  width?: string;
}

withDefaults(defineProps<ElmModalProps>(), {});

const slots = defineSlots<{
  default?: () => VNode;
}>();

const isOpen = defineModel<boolean>({
  default: false,
});
</script>

<style module lang="scss">
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
  transition: opacity 400ms;

  background-color: rgba(#23262a, 0.8);

  .modal {
    box-sizing: border-box;
    max-width: min(500px, calc(100vw - 1rem));
    width: var(--width, 100%);
    padding: 0.5rem;
    border-radius: 0.25rem;
    background-color: rgba(white, 0.8);
  }
}
</style>
