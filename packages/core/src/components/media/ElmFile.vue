<template>
  <div class="file">
    <div class="left-container">
      <DocumentIcon class="icon" />
      <ElmInlineText
        :text="
          name ?? getLastPathSegmentWithoutQueryOrHash(src) ?? 'unknown file'
        "
      />
    </div>

    <div class="right-container">
      <span :style="{ opacity: 0.6 }"
        ><ElmInlineText v-if="bytes" :text="formatBytes(bytes)"
      /></span>
      <ArrowDownTrayIcon class="download-icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowDownTrayIcon, DocumentIcon } from '@heroicons/vue/24/outline'
import ElmInlineText from '../inline/ElmInlineText.vue'

export interface ElmFileProps {
  /**
   * The name of the file.
   */
  name?: string

  /**
   * The source of the file.
   */
  src: string

  /**
   * The size of the file in bytes.
   */
  bytes?: number
}

withDefaults(defineProps<ElmFileProps>(), {})

function getLastPathSegmentWithoutQueryOrHash(
  urlString: string
): string | null {
  const cleanedUrl = urlString.split(/[?#]/)[0]
  const pathSegments = cleanedUrl.split('/').filter(Boolean)
  return pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : null
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}
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
