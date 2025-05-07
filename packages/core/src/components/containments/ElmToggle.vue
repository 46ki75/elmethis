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

    <transition
      :enter-from-class="$style['v-enter-from']"
      :enter-active-class="$style['v-enter-active']"
      :enter-to-class="$style['v-enter-to']"
      :leave-from-class="$style['v-leave-from']"
      :leave-active-class="$style['v-leave-active']"
      :leave-to-class="$style['v-leave-to']"
    >
      <div v-if="isOpen" :class="$style.content">
        <slot />
      </div>
    </transition>

    <transition
      :enter-from-class="$style['v-enter-from']"
      :enter-active-class="$style['v-enter-active']"
      :enter-to-class="$style['v-enter-to']"
      :leave-from-class="$style['v-leave-from']"
      :leave-active-class="$style['v-leave-active']"
      :leave-to-class="$style['v-leave-to']"
    >
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

  border: 1px solid rgba(black, 0.125);
  background-color: rgba(#3e434b, 0.05);
  [data-theme="dark"] & {
    border: 1px solid rgba(white, 0.125);
    background-color: rgba(#bec2ca, 0.1);
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

  border-radius: 0 0 0.25rem 0.25rem;

  background-color: rgba(white, 0.1);
  border: 1px solid rgba(black, 0.125);

  [data-theme="dark"] & {
    border: 1px solid rgba(white, 0.125);
    background-color: rgba(#bec2ca, 0.05);
  }
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
