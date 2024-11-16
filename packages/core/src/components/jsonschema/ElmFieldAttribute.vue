<template>
  <div :class="$style.wrapper">
    <div :class="$style.attribute">
      <Icon :icon="icon" :class="$style.icon" />
      <ElmInlineText :text="name" />
    </div>
    <ElmInlineText :text="content" />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import ElmInlineText from '../inline/ElmInlineText.vue'

export interface ElmFieldAttributeProps {
  icon: string
  name: string
  content: string
}

withDefaults(defineProps<ElmFieldAttributeProps>(), {})
</script>

<style module lang="scss">
.wrapper {
  margin-block: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.attribute {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.25rem;
  border-radius: 0.125rem;
  background-color: rgba(gray, 0.1);
  box-shadow: 0 0 0.125rem rgba(black, 0.2);
}

.icon {
  width: 1rem;
  height: 1rem;
  line-height: 1rem;
  color: rgba(black, 0.7);
  [data-theme='dark'] & {
    color: rgba(white, 0.7);
  }
}
</style>
