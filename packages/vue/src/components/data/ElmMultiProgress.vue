<template>
  <div
    :class="$style.container"
    :style="{
      '--weight': weight,
      '--border-radius': round ? 'calc(var(--weight) / 2)' : undefined,
    }"
  >
    <template v-for="p in computedProgress">
      <div
        :class="$style.bar"
        :style="{
          '--transform': `translateX(${p.start}%) scaleX(${p.scale})`,
          '--color': p.color,
        }"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Property } from "csstype";
import { computed } from "vue";

export interface ElmMultiProgressProps {
  progress: Array<{
    /**
     * The current value of the progress.
     */
    value: number;

    /**
     * The buffer value of the progress.
     */
    buffer?: number;

    /**
     * The color of the progress.
     */
    color: string;
  }>;

  /**
   * The weight of the progress.
   */
  weight?: Property.Height<string | number>;

  /**
   * Whether the progress should be round.
   */
  round?: boolean;
}

const props = withDefaults(defineProps<ElmMultiProgressProps>(), {
  weight: "4px",
  round: true,
});

const max = computed(() => props.progress.reduce((p, n) => p + n.value, 0));

const computedProgress = computed(() => {
  let cumulative = 0;
  return props.progress.map((p) => {
    const scale = (p.value / max.value) * 100;
    const start = cumulative;
    cumulative += scale;
    return { ...p, scale: scale / 100, start };
  });
});
</script>

<style module lang="scss">
@mixin bar($transition-duration: 800ms) {
  position: absolute;
  content: "";
  width: 100%;
  height: 100%;
  transition: transform $transition-duration;
  transform: var(--transform, scaleX(0));
  transform-origin: left;
}

.container {
  width: 100%;
  height: var(--weight);
  position: relative;
  border-radius: var(--border-radius);
  overflow: hidden;

  background-color: rgba(black, 0.1);
  [data-theme="dark"] & {
    background-color: rgba(white, 0.1);
  }
}

.bar {
  @include bar;
  background-color: var(--color, red);
}
</style>
