<template>
  <input v-model="input" ref="inputRef" type="text" :maxlength="length" />
  <div :class="$style.container">
    <div
      v-for="(char, index) in inputArray"
      :class="[
        $style['char-box'],
        {
          [$style.focused]: index + 1 === position
        }
      ]"
      @click="focus(index)"
    >
      <span :class="$style.char">
        {{ char }}
      </span>
    </div>
  </div>
  <div>DEBUG: {{ input }}</div>
  <div>POSITION: {{ position }}</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

export interface ElmTotpProps {
  length: number
}

const props = withDefaults(defineProps<ElmTotpProps>(), {})

const input = defineModel({
  default: ''
})

const inputRef = ref<HTMLInputElement | null>(null)

const inputArray = ref<Array<string | null>>(new Array(props.length).fill(null))

const position = ref(0)

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
    const cursorPosition = Math.min(toPosition, inputElement.value.length) + 1
    inputElement.setSelectionRange(cursorPosition - 1, cursorPosition)
    inputElement.focus()
    position.value = cursorPosition
  }
}

watch(input, (newVal) => {
  const currentLength = newVal.length
  if (currentLength < props.length) {
    focus(currentLength)
  } else {
    focus(position.value - 1)
  }
})
</script>

<style module lang="scss">
.container {
  display: flex;
  gap: 0.5rem;
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
