<template>
  <div
    class="bookmark"
    :style="{
      '--flex-direction': wide ? 'row' : 'column',
      '--image-width': wide ? '30%' : '100%',
      '--typography-width': wide ? '70%' : '100%'
    }"
  >
    <div class="image">
      <ElmImage :src="image" />
    </div>

    <div class="typography">
      <div class="title"><ElmInlineText :text="title" bold /></div>

      <div>
        <ElmInlineText
          :text="
            description.length > 200
              ? description.slice(0, 200) + '...'
              : description
          "
          size=".8rem"
          :style="{ opacity: 0.6 }"
        />
      </div>

      <div class="date" v-if="createdAt != null || updatedAt != null">
        <template v-if="createdAt != null">
          <CalendarDaysIcon class="icon" />
          <ElmInlineText :text="`${createdAt}`" size=".8rem" />
        </template>

        <template v-if="updatedAt != null">
          <ArrowPathIcon class="icon" />
          <ElmInlineText :text="`${updatedAt}`" size=".8rem" />
        </template>
      </div>

      <div v-if="!hideUrl" class="link">
        <div><ElmInlineLink :text="url" href="#" size=".8rem" /></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDaysIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import ElmInlineLink from '../inline/ElmInlineLink.vue'
import ElmInlineText from '../inline/ElmInlineText.vue'
import ElmImage from '../media/ElmImage.vue'

export interface ElmBookmarkProps {
  wide?: boolean

  hideUrl?: boolean

  /**
   * The title of the bookmark.
   */
  title: string

  /**
   * The description of the bookmark.
   */
  description?: string

  /**
   * The image to display.
   * This can be a URL or a base64-encoded image.
   */
  image: string

  /**
   * The URL to navigate to.
   */
  url: string

  /**
   * The date the bookmark was created.
   */
  createdAt?: string

  /*
   * The date the bookmark was last updated.
   */
  updatedAt?: string
}

withDefaults(defineProps<ElmBookmarkProps>(), {
  wide: true,
  hideUrl: false,
  description: 'No description provided'
})
</script>

<style scoped lang="scss">
.bookmark {
  display: flex;
  flex-direction: var(--flex-direction);
  box-shadow: 0 0 0.125rem rgba(black, 0.15);
  cursor: pointer;
  transition: background-color 200ms;
  background-color: rgba(white, 0.2);

  [data-theme='dark'] & {
    background-color: rgba(black, 0.2);
  }

  &:hover {
    background-color: rgba(#6987b8, 0.1);
  }

  &:active {
    background-color: rgba(#59b57c, 0.1);
  }

  .image {
    width: var(--image-width);
    opacity: 0.9;
  }

  .typography {
    width: var(--typography-width);
    box-sizing: border-box;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.5rem;

    .title {
      display: inline;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .link {
      width: 100%;
      display: flex;
      justify-content: flex-end;
    }

    .date {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
  }

  .icon {
    width: 16px;

    color: rgba(black, 0.7);
    [data-theme='dark'] & {
      color: rgba(white, 0.7);
    }
  }
}
</style>
