<template>
  <button
    :class="[
      $style.button,
      {
        [$style.enable]: !loading && !disabled,
        [$style.normal]: !primary,
        [$style.primary]: primary
      }
    ]"
    :style="{
      display: block ? 'flex' : 'inline-flex',
      width: block ? '100%' : 'auto',
      cursor: disabled ? 'not-allowed' : loading ? 'progress' : 'pointer',
      '--opacity': disabled ? 0.6 : undefined
    }"
    @click="handleClick"
  >
    <transition mode="out-in">
      <ElmDotLoadingIcon v-if="loading" size="1.5rem" />
      <span v-else :class="$style.flex">
        <slot />
      </span>
    </transition>
  </button>
</template>

<script setup lang="ts">
import ElmDotLoadingIcon from '../icon/ElmDotLoadingIcon.vue'

export interface ElmButtonProps {
  /**
   * Whether the button is in loading state.
   */
  loading?: boolean

  /**
   * Whether the button is block.
   */
  block?: boolean

  /**
   * Whether the button is disabled.
   */
  disabled?: boolean

  /**
   * Whether the button is primary.
   */
  primary?: boolean

  onClick: () => void
}

const props = withDefaults(defineProps<ElmButtonProps>(), {
  loading: false,
  block: false,
  disabled: false,
  primary: false
})

const handleClick = () => {
  if (!props.loading && !props.disabled && props.onClick) {
    props.onClick()
  }
}
</script>

<style module lang="scss">
.button {
  all: unset;
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

  [data-theme='dark'] & {
    box-shadow: 0 0 0.25rem rgba(black, 0.6);
    color: rgba(white, 0.6);
    background-color: rgba(white, 0.1);
  }
}

.primary {
  box-shadow: 0 0 0.25rem rgba(black, 0.2);
  color: rgba(white, 0.6);
  background-color: rgba(black, 0.8);

  [data-theme='dark'] & {
    box-shadow: 0 0 0.25rem rgba(black, 0.6);
    color: rgba(black, 0.6);
    background-color: rgba(white, 0.8);
  }
}

.enable {
  transition:
    opacity 200ms,
    transform 200ms;

  [data-theme='dark'] & {
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
