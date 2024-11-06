<template>
  <button
    :class="$style.button"
    :style="{
      display: block ? 'flex' : 'inline-flex',
      width: block ? '100%' : 'auto'
    }"
  >
    <transition mode="out-in">
      <ElmDotLoadingIcon v-if="loading" size="1.5rem" />
      <span v-else><slot /></span>
    </transition>
  </button>
</template>

<script setup lang="ts">
import ElmDotLoadingIcon from '../icon/ElmDotLoadingIcon.vue'

export interface ElmButtonProps {
  loading?: boolean

  block?: boolean
}

withDefaults(defineProps<ElmButtonProps>(), {
  loading: false,
  block: false
})
</script>

<style module lang="scss">
.button {
  all: unset;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  box-sizing: border-box;
  padding: 0.5rem 1.5rem;
  line-height: 1.5rem;

  user-select: none;
  cursor: pointer;
  box-shadow: 0 0 0.25rem rgba(black, 0.2);

  color: rgba(black, 0.6);
  background-color: rgba(white, 0.8);
  transition:
    background-color 200ms,
    transform 200ms;
  [data-theme='dark'] & {
    color: rgba(white, 0.6);
    box-shadow: 0 0 0.25rem rgba(black, 0.6);
    background-color: rgba(white, 0.1);

    &:hover {
      transform: translateX(-1px) translateY(-1px);
      background-color: rgba(#6987b8, 0.2);
    }

    &:active {
      transform: translateX(1px) translateY(1px);
      background-color: rgba(#59b57c, 0.2);
    }
  }

  &:hover {
    transform: translateX(-1px) translateY(-1px);
    background-color: rgba(#6987b8, 0.1);
  }

  &:active {
    transform: translateX(1px) translateY(1px);
    background-color: rgba(#59b57c, 0.1);
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
  transition: opacity 300ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
