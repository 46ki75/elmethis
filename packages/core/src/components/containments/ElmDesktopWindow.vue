<template>
  <div class="window">
    <div class="header">
      <div aria-hidden class="dot" :style="{ '--bg': '#c48691' }"></div>
      <div aria-hidden class="dot" :style="{ '--bg': '#c9b990' }"></div>
      <div aria-hidden class="dot" :style="{ '--bg': '#7cc598' }"></div>
    </div>
    <div class="body"><slot /></div>
  </div>
</template>

<script setup lang="ts">
export interface ElmDesktopWindowProps {}

withDefaults(defineProps<ElmDesktopWindowProps>(), {})
</script>

<style scoped lang="scss">
.window {
  min-height: 100px;
  border-radius: 0.25rem;
  overflow: hidden;
  box-shadow: 0 0 0.25rem rgba(black, 0.15);
  background-color: rgba(black, 0.05);
  [data-theme='dark'] & {
    box-shadow: 0 0 0.25rem rgba(black, 0.35);
    background-color: rgba(white, 0.05);
  }

  .header {
    box-sizing: border-box;
    padding: 0.5rem 0.75rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;
    height: 2rem;
    background-color: rgba(black, 0.1);

    .dot {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      background-color: var(--bg);
    }
  }
}
</style>
