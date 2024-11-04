<template>
  <div class="container" :style="{ backgroundColor: color }">
    <div class="icon" v-html="icon"></div>
    <div>
      <ElmInlineText :text="text" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { icons } from 'feather-icons'
import ElmInlineText from '../inline/ElmInlineText.vue'

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

const icon = icons['tag'].toSvg({
  width: 16,
  height: 16
})
</script>

<style scoped lang="scss">
.container {
  display: flex;
  width: min-content;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  border-radius: 0.25rem;
  gap: 0.25rem;
  padding: 0.125rem 0.25rem;
}

.icon {
  display: block;
  line-height: 1;
  margin: 0;
  padding: 0;
  color: rgba(black, 0.7);
  [data-theme='dark'] & {
    color: rgba(white, 0.7);
  }
}
</style>
