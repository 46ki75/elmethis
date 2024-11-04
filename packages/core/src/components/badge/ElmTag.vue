<template>
  <span class="container" :style="{ backgroundColor: color }">
    <span class="icon" v-html="icon"></span>
    <ElmInlineText :text="text" />
  </span>
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
  color: string
}

withDefaults(defineProps<ElmTagProps>(), {})

const icon = icons['tag'].toSvg({
  width: 16,
  height: 16
})
</script>

<style scoped lang="scss">
.container {
  display: inline-flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  border-radius: 0.25rem;
  gap: 0.25rem;
  padding: 0.125rem 0.25rem;
}

.icon {
  display: inline-block;
  vertical-align: middle;
  line-height: 1;
  margin: 0;
  padding: 0;
  color: rgba(black, 0.7);
  [data-theme='dark'] & {
    color: rgba(white, 0.7);
  }
}
</style>
