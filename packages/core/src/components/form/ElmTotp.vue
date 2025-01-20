<template>
  <div>
    <input
      :class="$style['dummy-input']"
      v-model="input"
      ref="inputRef"
      type="text"
      :maxlength="length"
    />
    <div :class="$style.container">
      <div
        v-for="(char, index) in inputArray"
        :class="[
          $style['char-box'],
          {
            [$style.focused]: index + 1 === currentPosition
          }
        ]"
        @click="focus(index + 1)"
      >
        <span :class="$style.char">
          {{ char }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onKeyStroke, useFocus } from '@vueuse/core'
import { nextTick } from 'process'
import { onMounted, ref, watch } from 'vue'

export interface ElmTotpProps {
  length: number
  focusOnMount?: boolean
}

const props = withDefaults(defineProps<ElmTotpProps>(), {
  focusOnMount: true
})

const input = defineModel({
  default: ''
})

const inputRef = ref<HTMLInputElement | null>(null)

const { focused } = useFocus(inputRef)

const inputArray = ref<Array<string | null>>(new Array(props.length).fill(null))

const currentPosition = ref(0)

watch(input, (newVal) => {
  const result: Array<string | null> = newVal.split('')

  while (result.length < props.length) {
    result.push(null)
  }

  inputArray.value = result
})

const focus = (toPosition: number): void => {
  if (inputRef.value) {
    const inputElement = inputRef.value
    const cursorPosition = Math.min(toPosition, inputElement.value.length + 1)
    inputElement.setSelectionRange(cursorPosition - 1, cursorPosition)
    inputElement.focus()
    currentPosition.value = cursorPosition
    if (toPosition <= 0) {
      focused.value = false
    }
  }
}

onKeyStroke(() => {
  if (focused.value) {
    nextTick(() => {
      const currentLength = input.value.length
      if (currentLength > currentPosition.value) {
        focus(currentPosition.value + 1)
      } else if (currentLength < props.length) {
        focus(currentLength + 1)
      } else if (currentLength === props.length) {
        focus(0)
      }
    })
  }
})

watch(focused, (newVal) => {
  if (!newVal) {
    focus(0)
  }
})

if (props.focusOnMount) {
  onMounted(() => {
    nextTick(() => {
      focus(1)
    })
  })
}
</script>

<style module lang="scss">
.dummy-input {
  all: unset;
  height: 1px;
  width: 1px;
  opacity: 0;
  user-select: none;
}

.container {
  display: flex;
  gap: 0.5rem;
  cursor: pointer;
}

.char-box {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 3.5rem;
  height: 4rem;
  border: solid 1px #ccc;
  border-radius: 0.25rem;
}

.char {
  font-size: 1.75rem;
  font-family: monospace;
}

.focused {
  transition:
    border-color 50ms,
    background-color 50ms;
  border-color: #6987b8;
  background-color: rgba(#6987b8, 0.05);
}
</style>
