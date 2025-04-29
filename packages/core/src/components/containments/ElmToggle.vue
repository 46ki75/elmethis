<template>
  <div :class="$style.toggle" :style="{ '--margin-block': margin }">
    <div
      :class="$style.summary"
      @click="handleClick"
      :style="{
        borderRadius: isOpen ? '0.25rem 0.25rem 0rem 0rem' : '0.25rem',
      }"
    >
      <div :class="$style['summary-left']">
        <ElmMdiIcon
          :class="$style.icon"
          :d="mdiChevronRight"
          :style="{ '--rotate': isOpen ? '90deg' : '0deg' }"
          color="#59b57c"
        />
        <div>
          <elm-inline-text v-if="summary != null" :text="summary" />
          <slot v-else name="summary" />
        </div>
      </div>

      <ElmMdiIcon
        :class="$style.icon"
        :d="mdiPlus"
        :style="{ '--rotate': isOpen ? '135deg' : '0deg' }"
        :color="isOpen ? '#b36472' : '#59b57c'"
      />
    </div>

    <transition>
      <div v-if="isOpen" :class="$style.content">
        <slot />
      </div>
    </transition>

    <transition>
      <div v-if="isOpen" :class="$style.close" @click="handleClick">
        <div :class="$style['close-button']">
          <ElmMdiIcon :d="mdiChevronUp" size="1.25em" color="#c56565" />
          <ElmInlineText text="CLOSE" color="#8e3636" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import ElmInlineText from "../typography/ElmInlineText.vue";
import type { Property } from "csstype";
import { VNode } from "vue";

import ElmMdiIcon from "../icon/ElmMdiIcon.vue";
import { mdiChevronRight, mdiChevronUp, mdiPlus } from "@mdi/js";

export interface ElmToggleProps {
  /**
   * The summary of the toggle.
   */
  summary?: string;

  /**
   * The margin of the toggle.
   */
  margin?: Property.MarginBlock;
}

withDefaults(defineProps<ElmToggleProps>(), {});

defineSlots<{
  default: () => VNode[];
  summary?: () => VNode[];
}>();

const isOpen = defineModel<boolean>("isOpen", {
  default: false,
});

const handleClick = (event: Event): void => {
  event.preventDefault();
  isOpen.value = !isOpen.value;
};
</script>

<style module lang="scss">
.toggle {
  margin-block: var(--margin-block);
}

.summary {
  box-sizing: border-box;
  width: 100%;
  padding: 1rem;
  width: 100%;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;

  border: 1px solid rgba(gray, 0.25);

  background-color: rgba(black, 0.025);
  [data-theme="dark"] & {
    background-color: rgba(white, 0.1);
  }
}

.summary-left {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.icon {
  transform: rotate(var(--rotate, 0deg));
  transition: transform 200ms;
}

.content {
  margin: 0;
  padding: 0.75rem;
  display: block;

  background-color: rgba(white, 0.05);
  border: 1px solid rgba(gray, 0.25);
  border-radius: 0 0 0.25rem 0.25rem;
}

.close {
  margin-block: 0.25rem;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 0.25rem;
}

.close-button {
  padding: 0.25rem;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 0.25rem;

  user-select: none;
  cursor: pointer;
  opacity: 0.7;
  transition: background-color 100ms;
  border-radius: 0.25rem;

  &:hover {
    background-color: rgba(#c56565, 0.15);
  }
}
</style>

<style scoped lang="scss">
.v-enter-to,
.v-leave-from {
  opacity: 1;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 200ms;
  transform-origin: top;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
