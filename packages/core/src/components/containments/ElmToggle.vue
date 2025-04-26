<template>
  <div :class="$style.toggle" :style="{ '--margin-block': margin }">
    <div :class="$style.summary" @click="handleClick">
      <div :style="{ display: 'flex', gap: '0.5rem' }">
        <Icon
          icon="mdi:chevron-right"
          :class="$style.icon"
          :style="{ '--rotate': isOpen ? '90deg' : '0deg' }"
        />
        <div>
          <elm-inline-text v-if="summary != null" :text="summary" />
          <slot v-else name="summary" />
        </div>
      </div>
      <Icon
        icon="mdi:plus"
        :class="$style.icon"
        :style="{
          '--rotate': isOpen ? '135deg' : '0deg',
          '--color': isOpen ? '#b36472' : undefined
        }"
      />
    </div>

    <transition>
      <div v-if="isOpen" :class="$style.content">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import ElmInlineText from '../typography/ElmInlineText.vue'
import { Icon } from '@iconify/vue'
import type { Property } from 'csstype'
import { VNode } from 'vue'

export interface ElmToggleProps {
  /**
   * The summary of the toggle.
   */
  summary?: string

  /**
   * The margin of the toggle.
   */
  margin?: Property.MarginBlock
}

withDefaults(defineProps<ElmToggleProps>(), {})

defineSlots<{
  default: () => VNode[]
  summary?: () => VNode[]
}>()

const isOpen = defineModel<boolean>('isOpen', {
  default: false
})

const handleClick = (event: Event): void => {
  event.preventDefault()
  isOpen.value = !isOpen.value
}
</script>

<style module lang="scss">
.toggle {
  margin-block: var(--margin-block);
  box-shadow: 0 0 0.125rem rgba(black, 0.3);
  border-radius: 0.25rem;
  overflow: hidden;
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

  background-color: rgba(black, 0.025);
  [data-theme='dark'] & {
    background-color: rgba(white, 0.1);
  }
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color, #59b57c);
  transform: rotate(var(--rotate, 0deg));
  transition: transform 200ms;
}

.content {
  margin: 0;
  padding: 0.75rem;
  display: block;

  background-color: rgba(white, 0.05);
  border-top: dashed 1px rgba(gray, 0.2);
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
  transform-origin: top;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
