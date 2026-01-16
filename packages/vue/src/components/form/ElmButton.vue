<template>
  <button
    :class="[
      $style.button,
      {
        [$style.enable]: !loading && !disabled,
        [$style.colored]: color,
        [$style.normal]: !color && !primary,
        [$style.primary]: !color && primary,
      },
    ]"
    :style="{
      display: block ? 'flex' : 'inline-flex',
      width: block ? '100%' : 'auto',
      cursor: disabled ? 'not-allowed' : loading ? 'progress' : 'pointer',
      '--opacity': disabled || loading ? 0.6 : undefined,
      '--color': color,
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

    <div :class="$style['button-ornament']"></div>
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

  color?: string;

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

  border: solid 2px rgba(#dbcaa0, 0.6);

  user-select: none;
  cursor: pointer;

  transition:
    opacity 200ms,
    transform 200ms;

  opacity: var(--opacity);
}

.button-ornament {
  position: absolute;
  content: "";
  bottom: -1px;
  right: -1px;
  height: 1rem;
  width: 1rem;
  background-color: rgba(#dbcaa0, 0.6);
  clip-path: polygon(100% 0%, 1000% 100%, 0% 100%);
}

.normal {
  color: rgba(black, 0.6);
  background-color: rgba(white, 0.8);

  [data-theme="dark"] & {
    color: rgba(white, 0.6);
    background-color: #3e434b;
  }
}

.primary {
  color: rgba(white, 0.6);
  background-color: #3e434b;

  [data-theme="dark"] & {
    color: rgba(black, 0.6);
    background-color: rgba(white, 0.8);
  }
}

.colored {
  background-color: var(--color);
}

.enable {
  transition:
    opacity 200ms,
    transform 100ms,
    box-shadow 200ms;

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
    box-shadow: 0.125rem 0.125rem 0.125rem rgba(gray, 0.25);
  }

  &:active {
    transform: translateX(1px) translateY(1px);
    opacity: var(--opacity, 0.5);
    box-shadow: -1px -1px 0.125rem rgba(gray, 0.25);
  }
}

.flex {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

@keyframes button-ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.ripple {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  background-color: rgba(#cdb57b, 0.15);
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
