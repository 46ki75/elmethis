<template>
  <label :class="$style.wrapper">
    <ElmInlineText text="Label" :class="$style.label" />
    <input type="text" :class="$style.input" />
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
  top: -100%;
  left: 0.25rem;
  padding: 0.25rem;
  font-size: 0.75rem;
  color: rgba(black, 0.6);
}

.input {
  all: unset;
  box-sizing: border-box;
  padding: 0.5rem 0.75rem;
  padding-top: 1.5rem;
  border-radius: 0.25rem;
  background-color: rgba(white, 0.8);
  color: rgba(black, 0.7);
  box-shadow: 0 0 0.25rem rgba(black, 0.1);
  cursor: text;
}
</style>
