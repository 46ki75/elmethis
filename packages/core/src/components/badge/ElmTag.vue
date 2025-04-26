<template>
  <div :class="$style.tag" :style="{ '--color': color }">
    <Icon
      icon="tabler:tag"
      :class="$style.icon"
      :style="{
        backgroundColor: color,
        '--font-color':
          getLuminance(color) > 0.5
            ? 'rgba(0,0,0,0.7)'
            : 'rgba(255,255,255,0.7)'
      }"
    />
    <div :class="$style.text">
      <ElmInlineText :style="{ color: 'unset' }" :text="text" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import ElmInlineText from '../typography/ElmInlineText.vue'
import { getLuminance } from 'polished'

export interface ElmTagProps {
  /**
   * The text to display in the tag.
   */
  text: string

  /**
   * The color of the tag.
   */
  color?: string
}

withDefaults(defineProps<ElmTagProps>(), {
  color: 'transparent'
})
</script>

<style module lang="scss">
.tag {
  display: inline-flex;
  width: min-content;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  border-width: 1px;
  border-style: solid;
  border-radius: 0.25rem;
  border-color: var(--color);

  color: rgba(black, 0.7);
  [data-theme='dark'] & {
    color: rgba(white, 0.7);
  }
}

.icon {
  display: block;
  line-height: 1;
  margin: 0;
  padding: 0.25rem;
  color: var(--font-color);
  border-radius: 0.125rem 0 0 0.125rem;
}

.text {
  white-space: nowrap;
  padding-inline: 0.5rem;
}
</style>
