<template>
  <label :class="$style.wrapper">
    <ElmInlineText text="Label" :class="$style.label" />
    <input v-model="input" type="text" :class="$style.input" />
    <BackspaceIcon :class="$style.icon" @click="handleDelete" />
  </label>
</template>

<script setup lang="ts">
import { BackspaceIcon } from '@heroicons/vue/24/solid'
import ElmInlineText from '../inline/ElmInlineText.vue'

export interface ElmTextFieldProps {}

withDefaults(defineProps<ElmTextFieldProps>(), {})

const input = defineModel({ default: '' })

const handleDelete = () => {
  input.value = ''
}
</script>

<style module lang="scss">
.wrapper {
  position: relative;

  &:has(input:focus) {
    .label {
      color: rgba(#34744c, 0.8);
    }
  }

  [data-theme='dark'] & {
    &:has(input:focus) {
      .label {
        color: rgba(#59b57c, 0.8);
      }
    }
  }
}

.label {
  position: absolute;
  top: -100%;
  left: 0.25rem;
  padding: 0.25rem;
  font-size: 0.75rem;
  color: rgba(black, 0.6);
  transition: color 200ms;
}

.input {
  all: unset;
  caret-color: rgba(black, 0.6);
  box-sizing: border-box;
  padding: 0.5rem 0.75rem;
  padding-top: 1.5rem;
  border-radius: 0.25rem;
  background-color: rgba(white, 0.8);
  color: rgba(black, 0.7);
  box-shadow: 0 0 0.25rem rgba(black, 0.1);
  border-style: solid;
  border-width: 1px;
  border-color: transparent;
  cursor: text;
  transition:
    color 200ms,
    border-color 200ms;

  [data-theme='dark'] & {
    caret-color: rgba(white, 0.6);
    background-color: rgba(white, 0.1);
    color: rgba(white, 0.7);
    box-shadow: 0 0 0.25rem rgba(black, 0.2);

    &:focus {
      border-color: rgba(#59b57c, 0.25);
      box-shadow: 0 0 0.125rem rgba(#59b57c, 0.5);
    }
  }

  &:focus {
    border-color: rgba(#a0d4b4, 0.25);
    box-shadow: 0 0 0.125rem rgba(#a0d4b4, 0.5);
  }

  &::selection {
    background-color: rgba(black, 0.7);
    color: rgba(white, 0.7);

    [data-theme='dark'] & {
      background-color: rgba(white, 0.7);
      color: rgba(black, 0.7);
    }
  }
}

.icon {
  position: absolute;
  padding: 0.25rem;
  border-radius: 50%;
  height: 20px;
  width: 20px;
  top: calc(50% - 16px);
  right: 8px;
  color: gray;

  transition: background-color 200ms;
  cursor: pointer;

  &:hover {
    background-color: rgba(gray, 0.2);
  }
}
</style>
