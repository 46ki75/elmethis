import { onKeyStroke } from '@vueuse/core'
import { ref } from 'vue'

interface Target {
  char: string
  status: 'typed' | 'incorrect' | 'current' | 'default'
}

export function useTyping() {
  const targetString = ref<string | null>(null)
  const targetArray = ref<Target[]>([])

  const currentCharIndex = ref(0)

  const mistakes = ref(0)

  const isFinished = ref(false)

  const start = (target: string) => {
    targetString.value = target
    targetArray.value = target
      .split('')
      .map((char) => ({ char, status: 'default' }))
    targetArray.value[currentCharIndex.value] = targetArray.value[0]
    targetArray.value[0].status = 'current'
    currentCharIndex.value = 0
  }

  onKeyStroke((event) => {
    if (
      targetArray.value[currentCharIndex.value] != null &&
      !isFinished.value &&
      event.key.length === 1 // ignore special keys
    ) {
      if (event.key === targetArray.value[currentCharIndex.value].char) {
        targetArray.value[currentCharIndex.value].status = 'typed'
        if (currentCharIndex.value === targetArray.value.length - 1) {
          isFinished.value = true
        } else {
          currentCharIndex.value += 1
          targetArray.value[currentCharIndex.value] =
            targetArray.value[currentCharIndex.value]
          targetArray.value[currentCharIndex.value].status = 'current'
        }
      } else {
        mistakes.value += 1
        targetArray.value[currentCharIndex.value].status = 'incorrect'
      }
    }
  })

  return { start, targetArray, isFinished, mistakes }
}
