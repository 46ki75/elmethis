<template>
  <button
    :class="[
      $style.button,
      {
        [$style.enable]: !loading && !disabled,
        [$style.normal]: !primary,
        [$style.primary]: primary,
      },
    ]"
    :style="{
      display: block ? 'flex' : 'inline-flex',
      width: block ? '100%' : 'auto',
      cursor: disabled ? 'not-allowed' : loading ? 'progress' : 'pointer',
      '--opacity': disabled ? 0.6 : undefined,
    }"
    @click="handleClick"
  >
    <div v-if="clicked" :class="$style.ripple"></div>
    <transition mode="out-in">
      <ElmDotLoadingIcon v-if="loading" size="1.5rem" />
      <span v-else :class="$style.flex">
        <slot />
      </span>
    </transition>
  </button>
</template>

<script setup lang="ts">
import ElmDotLoadingIcon from "../icon/ElmDotLoadingIcon.vue";
import { onUnmounted, ref } from "vue";

export interface ElmButtonProps {
  /**
   * Whether the button is in loading state.
   */
  loading?: boolean;

  /**
   * Whether the button is block.
   */
  block?: boolean;

  /**
   * Whether the button is disabled.
   */
  disabled?: boolean;

  /**
   * Whether the button is primary.
   */
  primary?: boolean;

  onClick: () => void;
}

const props = withDefaults(defineProps<ElmButtonProps>(), {
  loading: false,
  block: false,
  disabled: false,
  primary: false,
});

const clicked = ref(false);
const id = ref<number | undefined>();

const handleClick = () => {
  if (!props.loading && !props.disabled && props.onClick) {
    clicked.value = true;
    id.value = window.setTimeout(() => (clicked.value = false), 300);
    props.onClick();
  }
};

onUnmounted(() => {
  if (id.value) clearTimeout(id.value);
});
</script>

<style module lang="scss">
.button {
  all: unset;
  position: relative;
  overflow: hidden;
  min-height: 2.75rem;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.25rem;

  box-sizing: border-box;
  padding: 0.5rem 1.5rem;
  line-height: 1.5rem;

  user-select: none;
  cursor: pointer;

  transition:
    opacity 200ms,
    transform 200ms;

  opacity: var(--opacity);
}

.normal {
  box-shadow: 0 0 0.25rem rgba(black, 0.2);
  color: rgba(black, 0.6);
  background-color: rgba(white, 0.8);

  [data-theme="dark"] & {
    box-shadow: 0 0 0.25rem rgba(black, 0.6);
    color: rgba(white, 0.6);
    background-color: rgba(white, 0.1);
  }
}

.primary {
  box-shadow: 0 0 0.25rem rgba(black, 0.2);
  color: rgba(white, 0.6);
  background-color: rgba(black, 0.8);

  [data-theme="dark"] & {
    box-shadow: 0 0 0.25rem rgba(black, 0.6);
    color: rgba(black, 0.6);
    background-color: rgba(white, 0.8);
  }
}

.enable {
  transition:
    opacity 200ms,
    transform 200ms;

  [data-theme="dark"] & {
    &:hover {
      transform: translateX(-1px) translateY(-1px);
      opacity: var(--opacity, 0.7);
    }

    &:active {
      transform: translateX(1px) translateY(1px);
      opacity: var(--opacity, 0.5);
    }
  }

  &:hover {
    transform: translateX(-1px) translateY(-1px);
    opacity: var(--opacity, 0.7);
  }

  &:active {
    transform: translateX(1px) translateY(1px);
    opacity: var(--opacity, 0.5);
  }
}

.flex {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

@keyframes button-ripple {
  from {
    transform: scale(0);
    opacity: 1;
  }
  to {
    transform: scale(1);
    opacity: 0;
  }
}

.ripple {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  background-color: rgba(gray, 0.35);
  width: 100%;
  aspect-ratio: 1 / 1;
  transition: none;
  opacity: 0;

  animation-name: button-ripple;
  animation-duration: 300ms;
  animation-fill-mode: both;
  animation-timing-function: ease-out;
}
</style>

<style scoped lang="scss">
.v-enter-to,
.v-leave-from {
  opacity: 1;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 100ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
