<template>
  <label :class="$style.wrapper">
    <ElmInlineText text="Label" :class="$style.label" />
    <input v-model="input" :type="type" :class="$style.input" />

    <div :class="$style['icon-container']">
      <span :class="$style.suffix">@46ki75.com</span>
      <Component
        :class="$style.icon"
        @click="handleVisibleSwitch"
        :is="type === 'password' ? EyeSlashIcon : EyeIcon"
      />
      <BackspaceIcon :class="$style.icon" @click="handleDelete" />
    </div>

    <span
      v-if="maxLength != null"
      :class="$style['count']"
      :style="{
        '--color': input.length > maxLength ? '#c56565' : 'gray'
      }"
    >
      {{ `${String(input.length)} / ${String(maxLength)}` }}
    </span>
  </label>
</template>

<script setup lang="ts">
import { BackspaceIcon } from '@heroicons/vue/24/solid'
import ElmInlineText from '../inline/ElmInlineText.vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'

export interface ElmTextFieldProps {
  maxLength?: number
}

withDefaults(defineProps<ElmTextFieldProps>(), {})

const input = defineModel({ default: '' })

const type = ref('text')

const handleDelete = () => {
  input.value = ''
}

const handleVisibleSwitch = () => {
  type.value = type.value === 'text' ? 'password' : 'text'
}
</script>

<style module lang="scss">
.wrapper {
  position: relative;
  display: block;
  height: 100%;
  width: 100%;

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
  top: 0%;
  left: 0.25rem;
  padding: 0.25rem;
  font-size: 0.75rem;
  color: rgba(black, 0.6);
  transition: color 200ms;
}

.input {
  all: unset;
  height: 100%;
  width: 100%;
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

.icon-container {
  position: absolute;
  top: calc(50% - 8px);
  right: 8px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.suffix {
  color: gray;
  opacity: 0.8;
  user-select: none;
}

.icon {
  padding: 0.25rem;
  border-radius: 50%;
  height: 20px;
  width: 20px;
  color: gray;
  user-select: none;

  transition: background-color 200ms;
  cursor: pointer;

  &:hover {
    background-color: rgba(gray, 0.2);
  }
}
.count {
  position: absolute;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  top: 0;
  right: 0;
  color: var(--color);
  opacity: 0.8;
}
</style>
