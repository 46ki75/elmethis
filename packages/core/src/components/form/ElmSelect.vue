<template>
  <div
    ref="target"
    :class="[$style.wrapper, { [$style.active]: isActive }]"
    :style="{
      backgroundColor: disabled || loading ? 'rgba(0,0,0,0.15)' : undefined,
    }"
    @click="handleToggle"
  >
    <div :class="$style.header">
      <span
        :class="[$style.label, textStyle.text]"
        :style="{ color: isActive ? '#59b57c' : undefined }"
        >{{ label }}</span
      >
    </div>

    <div :class="$style.body">
      <div :class="$style.select">
        <div :class="[$style.selected, textStyle.text]">
          <Transition
            mode="out-in"
            :leave-from-class="$style['selected-leave-from']"
            :enter-to-class="$style['selected-enter-to']"
            :enter-active-class="$style['selected-enter-active']"
            :leave-active-class="$style['selected-leave-active']"
            :enter-from-class="$style['selected-enter-from']"
            :leave-to-class="$style['selected-leave-to']"
          >
            <div v-if="selectedOption" :key="selectedOption.id">
              <span>
                {{ selectedOption.label }}
              </span>
              <span
                v-if="selectedOption.description"
                :class="$style.description"
              >
                {{ selectedOption.description }}
              </span>
            </div>

            <div v-else :class="$style.fallback">
              <ElmMdiIcon :d="mdiArrowDownDropCircleOutline" />
              <span>{{ placeholder ?? "Select an option" }} </span>
            </div>
          </Transition>
        </div>

        <ElmMdiIcon :d="mdiMenuDown" size="1.5rem" />

        <Transition
          :enter-from-class="fadeStyle['fade-enter-from']"
          :enter-active-class="fadeStyle['fade-enter-active']"
          :enter-to-class="fadeStyle['fade-enter-to']"
          :leave-from-class="fadeStyle['fade-leave-from']"
          :leave-active-class="fadeStyle['fade-leave-active']"
          :leave-to-class="fadeStyle['fade-leave-to']"
        >
          <div v-if="isActive" :class="$style.pulldown">
            <div
              v-for="option in options"
              :key="option.id"
              :class="[$style.option, textStyle.text]"
              @click="handleSelect(option.id)"
            >
              <ElmMdiIcon :d="mdiChevronRight" color="#868e9c" size="0.75em" />
              <span>
                {{ option.label }}
              </span>
              <span v-if="option.description" :class="$style.description">
                {{ option.description }}
              </span>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import ElmMdiIcon from "../icon/ElmMdiIcon.vue";
import {
  mdiMenuDown,
  mdiChevronRight,
  mdiArrowDownDropCircleOutline,
} from "@mdi/js";
import { onClickOutside } from "@vueuse/core";

import textStyle from "../../styles/text.module.scss";
import fadeStyle from "../../styles/transition-fade.module.scss";

export interface ElmSelectProps {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

withDefaults(defineProps<ElmSelectProps>(), {
  disabled: false,
  loading: false,
});

const options =
  defineModel<Array<{ id: string; label: string; description?: string }>>(
    "options"
  );

const selectedOption = defineModel<{
  id: string;
  label: string;
  description?: string;
} | null>("selected-option");

const isActive = ref<boolean>(false);

const handleToggle = () => {
  isActive.value = !isActive.value;
};

const handleSelect = (id: string) => {
  if (options.value) {
    const [selected] = options.value.filter((option) => option.id === id);
    selectedOption.value = selected;
  }
};

const target = useTemplateRef<HTMLElement>("target");

onClickOutside(target, (_) => {
  if (isActive.value) isActive.value = false;
});
</script>

<style module lang="scss">
.wrapper {
  user-select: none;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  border-style: solid;
  border-width: 1px;
  border-color: transparent;

  transition:
    border-color 200ms,
    background-color 200ms;

  background-color: rgba(white, 0.8);
  box-shadow: 0 0 0.125rem rgba(black, 0.15);

  [data-theme="dark"] & {
    background-color: rgba(white, 0.15);
    box-shadow: 0 0 0.125rem rgba(black, 0.75);
  }
}

.active {
  border-color: rgba(#59b57c, 0.5);
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
  transition: color 200ms;
  user-select: none;
}

.body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 0.25rem;
  padding-left: 0.25rem;
  cursor: pointer;
}

.select {
  padding: 0.5rem;
  width: 100%;
  height: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected {
  width: 100%;
  overflow: hidden;
}

.fallback {
  opacity: 0.6;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
}

.pulldown {
  position: absolute;
  top: 4rem;
  left: 0;

  box-sizing: border-box;
  width: 100%;
  padding: 0.25rem;
  border-radius: 0.25rem;

  background-color: rgba(white, 0.8);
  box-shadow: 0 0 0.125rem rgba(black, 0.15);

  [data-theme="dark"] & {
    background-color: rgba(white, 0.15);
    box-shadow: 0 0 0.125rem rgba(black, 0.75);
  }
}

.option {
  overflow: hidden;
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
  border-radius: 0.25rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.25rem;
  transition: background-color 100ms;
  cursor: pointer;

  &:hover {
    background-color: rgba(#bec2ca, 0.3);
    [data-theme="dark"] & {
      background-color: rgba(#bec2ca, 0.2);
    }
  }
}

.description {
  box-sizing: border-box;
  opacity: 0.35;
  padding-left: 0.25rem;
  font-size: 0.75em;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.selected-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.selected-enter-to,
.selected-leave-from {
  opacity: 1;
  transform: translateY(0%);
}

.selected-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.selected-enter-active,
.selected-leave-active {
  transition:
    opacity 200ms,
    transform 100ms;
}
</style>
