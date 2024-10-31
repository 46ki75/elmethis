<template>
  <div class="wrapper">
    <div class="summary" @click="handleClick">
      <div :style="{ display: 'flex', gap: '0.5rem' }">
        <ChevronRightIcon
          class="icon"
          :style="{ '--rotate': isOpen ? '90deg' : '0deg' }"
        />
        <strong> <elm-inline-text :text="summary" /></strong>
      </div>
      <PlusIcon
        class="icon"
        :style="{
          '--rotate': isOpen ? '135deg' : '0deg',
          '--color': isOpen ? '#b36472' : undefined
        }"
      />
    </div>

    <transition>
      <div v-if="isOpen" class="content">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import ElmInlineText from '../inline/ElmInlineText.vue'
import { ChevronRightIcon, PlusIcon } from '@heroicons/vue/24/outline'

export interface ElmToggleProps {
  /**
   * The summary of the toggle.
   */
  summary: string
}

withDefaults(defineProps<ElmToggleProps>(), {})

const isOpen = defineModel<boolean>('isOpen', {
  default: false
})

const handleClick = (event: Event): void => {
  event.preventDefault()
  isOpen.value = !isOpen.value
}
</script>

<style scoped lang="scss">
.wrapper {
  box-shadow: 0 0 0.25rem rgba(black, 0.05);
}

.icon {
  width: 1.25rem;
  color: var(--color, #59b57c);
  transform: rotate(var(--rotate, 0deg));
  transition: transform 200ms;
}

.summary {
  box-sizing: border-box;
  width: 100%;
  padding: 1rem;
  width: 100%;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;

  border: solid 1px rgba(black, 0.1);
  background-color: rgba(black, 0.05);
  [data-theme='dark'] & {
    border-color: rgba(white, 0.1);
    background-color: rgba(white, 0.075);
  }
}

.content {
  margin: 0;
  padding: 0.75rem;
  display: block;

  border: solid 1px rgba(black, 0.1);
  border-top: none;
  background-color: rgba(black, 0.025);
  [data-theme='dark'] & {
    border-color: rgba(white, 0.1);
    background-color: rgba(white, 0.025);
  }
}

.v-enter-to,
.v-leave-from {
  opacity: 1;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 200ms;
  transform-origin: top;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
