<template>
  <div class="file">
    <div class="left-container">
      <DocumentIcon class="icon" />
      <ElmInlineText :text="name" />
    </div>

    <div class="right-container">
      <ArrowDownTrayIcon class="download-icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowDownTrayIcon, DocumentIcon } from '@heroicons/vue/24/outline'
import ElmInlineText from '../inline/ElmInlineText.vue'

export interface ElmFileProps {
  name: string
  src: string
}

withDefaults(defineProps<ElmFileProps>(), {})
</script>

<style scoped lang="scss">
.file {
  box-sizing: border-box;
  width: 100%;
  padding: 1rem;
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: rgba(white, 0.2);
  [data-theme='dark'] & {
    background-color: rgba(black, 0.2);
  }

  .left-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.75rem;

    .icon {
      width: 20px;
      transition: color 200ms;
      color: rgba(black, 0.8);
      [data-theme='dark'] & {
        color: rgba(white, 0.8);
      }
    }
  }

  .right-container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;

    .download-icon {
      padding: 0.125rem;
      width: 20px;
      cursor: pointer;
      transition:
        color 200ms,
        background-color 200ms;
      color: rgba(black, 0.8);
      [data-theme='dark'] & {
        color: rgba(white, 0.8);
      }

      &:hover {
        background-color: rgba(black, 0.1);
        [data-theme='dark'] & {
          background-color: rgba(white, 0.1);
        }
      }
    }
  }
}
</style>
