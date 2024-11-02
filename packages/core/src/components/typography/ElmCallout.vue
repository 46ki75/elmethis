<template>
  <aside
    ref="target"
    class="callout"
    :style="{
      '--border-color': colors[type].code,
      '--bg-color': rgba(colors[type].code, 0.1),
      '--scale': targetIsVisible ? 1 : 0
    }"
  >
    <div class="header">
      <component
        :is="colors[type].icon"
        class="icon"
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
import {
  ChartBarSquareIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'
import ElmInlineText from '../inline/ElmInlineText.vue'
import { ref, type FunctionalComponent } from 'vue'
import { rgba } from 'polished'
import { useIntersectionObserver } from '@vueuse/core'

export type AlertType = 'note' | 'tip' | 'important' | 'warning' | 'caution'

const colors: Record<AlertType, { code: string; icon: FunctionalComponent }> = {
  note: { code: '#6987b8', icon: ChartBarSquareIcon },
  tip: { code: '#59b57c', icon: LightBulbIcon },
  important: { code: '#9771bd', icon: ShieldCheckIcon },
  warning: { code: '#b8a36e', icon: ExclamationTriangleIcon },
  caution: { code: '#b36472', icon: XCircleIcon }
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

<style scoped lang="scss">
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
  color: var(--icon-color);
}
</style>
