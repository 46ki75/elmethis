<template>
  <div>
    <span
      v-for="target in targetArray"
      :class="[
        $style.char,
        {
          [$style.typed]: target.status === 'typed',
          [$style.current]: target.status === 'current',
          [$style.incorrect]: target.status === 'incorrect',
        },
      ]"
      >{{ target.char }}</span
    >
  </div>
  <div v-if="isFinished">FINISH!</div>
  <div v-if="mistakes > 0">Mistakes: {{ mistakes }}</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useTyping } from "../../hooks/useTyping";

export interface ElmTypingProps {}

withDefaults(defineProps<ElmTypingProps>(), {});

const { start, targetArray, isFinished, mistakes } = useTyping();

onMounted(() => {
  start("Typing game");
});
</script>

<style module lang="scss">
.char {
  font-family: ui-monospace, monospace;
  color: rgba(black, 0.7);

  &::selection {
    color: rgba(white, 0.7);
    background-color: rgba(black, 0.7);
  }

  [data-theme="dark"] & {
    color: rgba(white, 0.7);

    &::selection {
      color: rgba(black, 0.7);
      background-color: rgba(white, 0.7);
    }
  }
}

.typed {
  opacity: 0.5;
}

.current {
  font-weight: bold;
  text-decoration: underline;
}

.incorrect {
  color: #c56565;
  text-decoration: underline;
}
</style>
