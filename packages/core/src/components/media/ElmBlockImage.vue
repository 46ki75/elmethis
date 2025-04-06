<template>
  <div :class="$style.container">
    <div
      :style="{
        boxShadow: shadow ? '0 0 0.125rem #b3b3b3' : undefined,
        ...(rounded ? { borderRadius: '0.25rem', overflow: 'hidden' } : {})
      }"
    >
      <ElmImage v-bind="props" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ElmImage, { type ElmImageProps } from './ElmImage.vue'

export type ElmBlockImageProps = {
  rounded?: boolean

  shadow?: boolean
} & ElmImageProps

const props = withDefaults(defineProps<ElmBlockImageProps>(), {
  rounded: true,
  shadow: true
})
</script>

<style module lang="scss">
.container {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
