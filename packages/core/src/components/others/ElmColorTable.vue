<template>
  <div class="container">
    <template v-for="color in colors">
      <div class="row-container">
        <div class="color-name" :style="{ '--color': color.code }">
          {{ color.name }}
        </div>
        <template
          v-for="darkness in [
            -0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2
          ]"
        >
          <ElmColorSample :color="darken(darkness, color.code)" />
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { darken } from 'polished'
import ElmColorSample from './ElmColorSample.vue'

export interface ElmTemplateProps {}

withDefaults(defineProps<ElmTemplateProps>(), {})

const colors = [
  { name: 'crimson', code: '#b36472' },
  { name: 'amber', code: '#bf7e71' },
  { name: 'gold', code: '#b8a36e' },
  { name: 'emerald', code: '#59b57c' },
  { name: 'blue', code: '#6987b8' },
  { name: 'purple', code: '#9771bd' },
  { name: 'pink', code: '#c9699e' },
  { name: 'slate', code: '#868e9c' }
]
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0.25rem;

  .row-container {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: row;
    gap: 0.25rem;

    .color-name {
      width: 6rem;
      color: var(--color);

      &::selection {
        background-color: var(--color);
        color: white;
      }
    }
  }
}
</style>
