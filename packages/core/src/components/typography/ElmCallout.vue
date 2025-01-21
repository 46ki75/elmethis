<template>
  <aside
    ref="target"
    :class="$style.callout"
    :style="{
      '--border-color': colors[type].code,
      '--bg-color': rgba(colors[type].code, 0.1),
      '--scale': targetIsVisible ? 1 : 0
    }"
  >
    <div :class="$style.header">
      <Icon
        :icon="colors[type].icon"
        class="icon"
        :class="$style.icon"
        :style="{ '--icon-color': colors[type].code }"
      />
      <elm-inline-text :text="type.toUpperCase()" :color="colors[type].code" />
    </div>
    <div>
      <slot />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js'
import ElmInlineText from '../inline/ElmInlineText.vue'
import { ref } from 'vue'
import { rgba } from 'polished'
import { useIntersectionObserver } from '@vueuse/core'

export type AlertType = 'note' | 'tip' | 'important' | 'warning' | 'caution'

const colors: Record<AlertType, { code: string; icon: string }> = {
  note: {
    code: '#6987b8',
    icon: 'mdi:information-slab-circle-outline'
  },
  tip: { code: '#59b57c', icon: 'mdi:lightbulb-on-outline' },
  important: {
    code: '#9771bd',
    icon: 'mdi:message-alert-outline'
  },
  warning: {
    code: '#b8a36e',
    icon: 'mdi:warning-outline'
  },
  caution: {
    code: '#b36472',
    icon: 'mdi:car-brake-warning'
  }
}

export interface ElmCalloutProps {
  /**
   * Type of alert
   */
  type?: AlertType
}

withDefaults(defineProps<ElmCalloutProps>(), {
  type: 'note'
})

const target = ref(null)
const targetIsVisible = ref(false)

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  targetIsVisible.value = isIntersecting
})
</script>

<style module lang="scss">
.callout {
  margin-block: 2rem;
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-left: solid 4px var(--border-color);

  &::after {
    position: absolute;
    z-index: -1;
    content: '';
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: var(--bg-color);
    transition: transform 800ms;
    transform: scaleX(var(--scale));
    transform-origin: left;
  }
}

.header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  width: 20px;
  height: 20px;
  color: var(--icon-color);
}
</style>
