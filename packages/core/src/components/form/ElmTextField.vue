<template>
  <div :class="$style.wrapper">
    <div :class="$style.header">
      <label :for="id" :class="$style.label">
        <ElmInlineText :text="label" />
      </label>
      <ElmInlineText
        v-if="maxLength != null"
        :text="`${input.length} / ${maxLength}`"
        :color="input.length > maxLength ? '#c56565' : 'gray'"
        size="0.75rem"
      />
    </div>
    <div :class="$style.body">
      <input :id="id" v-model="input" :type="type" :class="$style.input" />

      <div :class="$style['icon-box']">
        <span :class="$style.suffix">
          <ElmInlineText v-if="suffix != null" :text="suffix" />
        </span>

        <component
          :is="type === 'text' ? EyeIcon : EyeSlashIcon"
          :class="$style.icon"
          @click="handleVisibleSwitch"
        />
        <BackspaceIcon :class="$style.icon" @click="handleDelete" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BackspaceIcon } from '@heroicons/vue/24/solid'
import ElmInlineText from '../inline/ElmInlineText.vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'
import { nanoid } from 'nanoid'

const id = nanoid()

export interface ElmTextFieldProps {
  label: string
  maxLength?: number
  suffix?: string
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
  box-sizing: border-box;
  width: 100%;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  background-color: rgba(white, 0.8);
  box-shadow: 0 0 0.25rem rgba(black, 0.15);

  [data-theme='dark'] & {
    background-color: rgba(white, 0.1);
    box-shadow: 0 0 0.25rem rgba(black, 0.6);
  }
}

.header {
  box-sizing: border-box;
  height: 0.75rem;
  padding: 0 0.25rem;
  display: flex;
  justify-content: space-between;
}

.label {
  display: inline;
  margin: 0;
  padding: 0;
  font-size: 0.75rem;
  line-height: 0.75rem;
  height: 0.75rem;
  vertical-align: top;

  color: rgba(black, 0.7);

  [data-theme='dark'] & {
    color: rgba(white, 0.7);
  }
}

.body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 0.5rem;
}

.input {
  all: unset;
  box-sizing: border-box;
  padding: 0.5rem;
  width: 100%;
  color: rgba(black, 0.7);
  caret-color: rgba(black, 0.7);

  &::selection {
    background-color: rgba(black, 0.7);
    color: rgba(white, 0.7);
  }

  [data-theme='dark'] & {
    color: rgba(white, 0.7);
    caret-color: rgba(white, 0.7);

    &::selection {
      background-color: rgba(white, 0.7);
      color: rgba(black, 0.7);
    }
  }
}

.icon-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon {
  box-sizing: border-box;
  border-radius: 50%;
  padding: 0.25rem;
  width: 28px;
  height: 28px;
  transition: background-color 200ms;
  cursor: pointer;
  color: gray;

  &:hover {
    background-color: rgba(gray, 0.2);
  }
}

.suffix {
  opacity: 0.6;
  padding: 0 0.5rem;
  user-select: none;
}
</style>
