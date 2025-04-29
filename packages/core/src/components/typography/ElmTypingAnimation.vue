<template>
  <span :class="$style.text" :style="{ fontSize }"
    >{{ display }}<span :class="$style.cursor">&nbsp;</span>
  </span>
</template>

<script setup lang="ts">
import type { Property } from "csstype";
import { onMounted, ref } from "vue";

export interface ElmTypingAnimationProps {
  /**
   * The texts to display.
   */
  texts: string[];

  /**
   * The interval between each text.
   */
  interval?: number;

  /**
   * The font size of the text.
   */
  fontSize: Property.FontSize<string | number>;
}

const props = withDefaults(defineProps<ElmTypingAnimationProps>(), {
  texts: () => [],
  interval: 3000,
  fontSize: "1rem",
});

const sleep = (duration: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};

const display = ref("");

onMounted(async () => {
  while (true) {
    for (const text of props.texts) {
      for (const char of text) {
        await sleep(75);
        display.value += char;
      }
      await sleep(props.interval);
      while (true) {
        if (display.value === "") break;
        display.value = display.value.slice(0, -1);
        await sleep(25);
      }
      await sleep(200);
    }
  }
});
</script>

<style module lang="scss">
.text {
  font-family: monospace;
  color: rgba(black, 0.8);
  &::selection {
    color: rgba(white, 0.8);
    background-color: rgba(black, 0.8);
  }

  [data-theme="dark"] & {
    color: rgba(white, 0.8);
    &::selection {
      color: rgba(black, 0.8);
      background-color: rgba(white, 0.8);
    }
  }
}

.default {
  margin-inline: 1px;
  user-select: none;
  background-color: rgba(black, 0.15);

  [data-theme="dark"] & {
    background-color: rgba(white, 0.25);
  }
}
</style>
