<template>
  <div :class="$style.file" :style="{ '--margin-block': margin }">
    <div :class="$style['left-container']">
      <Icon icon="mdi:file-outline" :class="$style.icon" />
      <ElmInlineText
        :text="
          name ?? getLastPathSegmentWithoutQueryOrHash(src) ?? 'unknown file'
        "
      />
    </div>

    <div :class="$style['right-container']">
      <span :style="{ opacity: 0.6 }"
        ><ElmInlineText v-if="filesize" :text="filesize"
      /></span>
      <Icon
        icon="mdi:download"
        :class="$style['download-icon']"
        @click="
          () => {
            downloadFile(
              src,
              name ??
                getLastPathSegmentWithoutQueryOrHash(src) ??
                'unknown file'
            )
          }
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import ElmInlineText from '../inline/ElmInlineText.vue'
import type { Property } from 'csstype'

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
  filesize?: string

  /**
   * The margin of the file.
   */
  margin?: Property.MarginBlock
}

withDefaults(defineProps<ElmFileProps>(), {})

function getLastPathSegmentWithoutQueryOrHash(
  urlString: string
): string | null {
  const cleanedUrl = urlString.split(/[?#]/)[0]
  const pathSegments = cleanedUrl.split('/').filter(Boolean)
  return pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : null
}

async function downloadFile(url: string, filename: string) {
  let link
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to download file')

    const blob = await response.blob()

    link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  } catch (error) {
    console.error('ERROR:', error)
  } finally {
    if (link) URL.revokeObjectURL(link.href)
  }
}
</script>

<style module lang="scss">
.file {
  margin-block: var(--margin-block);
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
      height: 20px;
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
      height: 20px;
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
