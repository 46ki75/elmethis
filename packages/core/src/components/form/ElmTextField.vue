<template>
  <label :class="$style.wrapper">
    <ElmInlineText text="Label" />
    <input type="text" />
  </label>
</template>

<script setup lang="ts">
import ElmInlineText from '../inline/ElmInlineText.vue'

export interface ElmTextFieldProps {}

withDefaults(defineProps<ElmTextFieldProps>(), {})
</script>

<style module lang="scss">
.wrapper {
  position: relative;
}

.label {
  position: absolute;
  top: 0;
  left: 0;
}

.input {
  all: unset;
  box-sizing: border-box;
  padding: 0.5rem;
}
</style>
