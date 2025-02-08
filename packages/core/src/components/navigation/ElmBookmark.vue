<template>
  <div :class="$style.parent" :style="{ '--margin-block': margin }">
    <a
      :class="$style.bookmark"
      :href="url"
      :target="openInNewTab ? '_blank' : undefined"
      rel="noopener noreferrer"
      @click="handleClick"
    >
      <div v-if="image != null" :class="$style.image">
        <ElmImage :src="image" />
      </div>

      <div :class="$style.typography">
        <div :class="$style.title">
          <ElmInlineText :text="title ?? 'No title provided'" bold />
        </div>

        <div>
          <ElmInlineText
            :text="
              description == null
                ? 'No description provided'
                : description.length > 100
                  ? description.slice(0, 100) + '...'
                  : description
            "
            size=".8rem"
            :style="{ opacity: 0.6 }"
          />
        </div>

        <div :class="$style.date" v-if="createdAt != null || updatedAt != null">
          <template v-if="createdAt != null">
            <Icon icon="mdi:calendar-month" :class="$style.icon" />
            <ElmInlineText :text="`${createdAt}`" size=".8rem" />
          </template>

          <template v-if="updatedAt != null">
            <Icon icon="mdi:calendar-refresh" :class="$style.icon" />
            <ElmInlineText :text="`${updatedAt}`" size=".8rem" />
          </template>
        </div>

        <div v-if="!hideUrl && url != null" :class="$style.link">
          <img
            v-if="favicon"
            :src="favicon"
            alt="favicon"
            :class="$style.favicon"
          />
          <ElmInlineText :text="`${url}`" size=".8rem" color="#6987b8" />
        </div>
      </div>
    </a>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import ElmInlineText from '../inline/ElmInlineText.vue'
import ElmImage from '../media/ElmImage.vue'
import type { Property } from 'csstype'

export interface ElmBookmarkProps {
  /**
   * Whether to hide the URL.
   */
  hideUrl?: boolean

  /**
   * Whether to open the link in a new tab.
   * Defaults to `true`.
   */
  openInNewTab?: boolean

  /**
   * The title of the bookmark.
   */
  title?: string

  /**
   * The description of the bookmark.
   */
  description?: string

  /**
   * The image to display.
   * This can be a URL or a base64-encoded image.
   */
  image?: string

  /**
   * The URL to navigate to.
   */
  url?: string

  /**
   * The date the bookmark was created.
   */
  createdAt?: string

  /*
   * The date the bookmark was last updated.
   */
  updatedAt?: string

  /**
   * The function to call when the link is clicked.
   * If provided, the default behavior (navigating to the URL) is prevented.
   */
  onClick?: () => void

  /**
   * The margin of the bookmark.
   */
  margin?: Property.MarginBlock

  /**
   * The URL of the favicon.
   */
  favicon?: string
}

const props = withDefaults(defineProps<ElmBookmarkProps>(), {
  isHorizontal: true,
  openInNewTab: true,
  hideUrl: false,
  description: 'No description provided'
})

function handleClick(event: MouseEvent) {
  if (props.onClick) {
    event.preventDefault()
    props.onClick()
  }
}
</script>

<style module lang="scss">
.parent {
  container-type: inline-size;
  margin-block: var(--margin-block);
  border-radius: 0.25rem;
  box-shadow: 0 0 0.125rem rgba(black, 0.1);
  overflow: hidden;

  transition:
    background-color 200ms,
    transform 200ms;

  &:hover {
    background-color: rgba(#6987b8, 0.1);
    transform: translateX(-0.125rem) translateY(-0.125rem);
  }

  &:active {
    background-color: rgba(#59b57c, 0.1);
    transform: translateX(0) translateY(0);
  }
}

.bookmark {
  all: unset;
  display: flex;
  cursor: pointer;
  background-color: rgba(white, 0.5);

  [data-theme='dark'] & {
    background-color: rgba(black, 0.2);
  }

  flex-direction: row;
  height: 120px;

  @container (max-width: 700px) {
    & {
      flex-direction: column;
      height: auto;
    }
  }

  .image {
    overflow: hidden;
    height: 100%;
    opacity: 0.9;
    display: flex;
    justify-content: center;
    align-items: center;
    object-fit: cover;
    object-position: center;
    aspect-ratio: 2 / 1;
    min-width: min-content;
    max-width: 35%;

    @container (max-width: 700px) {
      & {
        min-width: unset;
        max-width: unset;
        width: 100%;
      }
    }
  }

  .typography {
    overflow: hidden;
    box-sizing: border-box;
    padding: 0.5rem;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.25rem;

    .title {
      display: inline;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .date {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  .icon {
    width: 16px;
    height: 16px;

    color: rgba(black, 0.7);
    [data-theme='dark'] & {
      color: rgba(white, 0.7);
    }
  }
}

.link {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  gap: 0.5rem;
}

.favicon {
  width: 16px;
  height: 16px;
}
</style>
