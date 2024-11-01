<template>
  <nav
    class="container"
    ref="target"
    :style="{
      '--opacity': targetIsVisible ? 1 : 0
    }"
  >
    <template v-for="(link, index) in links">
      <div class="link-container" @click="link.onClick">
        <component
          :class="['icon', 'fade']"
          :is="
            index === 0
              ? HomeIcon
              : index === links.length - 1
                ? FolderOpenIcon
                : DocumentTextIcon
          "
          :style="{
            '--delay': `${index * 100}ms`
          }"
        />
        <ElmInlineText
          :text="link.text"
          :class="['link-text', 'fade']"
          :style="{
            '--delay': `${index * 100 + 50}ms`
          }"
        />
      </div>

      <ChevronRightIcon
        v-if="links.length !== index + 1"
        :class="['chevron', 'fade']"
        :style="{
          '--delay': `${index * 100 + 100}ms`
        }"
      />
    </template>
  </nav>
</template>

<script setup lang="ts">
import {
  ChevronRightIcon,
  DocumentTextIcon,
  FolderOpenIcon,
  HomeIcon
} from '@heroicons/vue/24/outline'
import ElmInlineText from '../inline/ElmInlineText.vue'
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

export interface ElmBreadcrumbProps {
  /**
   * The links to display.
   */
  links: Array<{
    /**
     * The text to display.
     */
    text: string

    /**
     * The action to perform when the link is clicked.
     */
    onClick?: () => void
  }>
}

withDefaults(defineProps<ElmBreadcrumbProps>(), {})

const target = ref(null)
const targetIsVisible = ref(false)

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  targetIsVisible.value = isIntersecting
})
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  user-select: none;

  .icon {
    width: 20px;
    color: rgba(black, 0.7);
    [data-theme='dark'] & {
      color: rgba(white, 0.7);
    }
  }

  .chevron {
    width: 12px;
    height: 12px;
    color: gray;
  }

  .link-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    box-sizing: border-box;
    padding: 0.25rem;
    border-radius: 0.25rem;
    cursor: pointer;

    transition:
      background-color 200ms,
      transform 200ms;

    &:hover {
      background-color: rgba(#6987b8, 0.2);
      transform: translateX(-1px) translateY(-1px);
    }

    &:active {
      background-color: rgba(#59b57c, 0.2);
      transform: translateX(1px) translateY(1px);
    }
  }
}

.fade {
  opacity: var(--opacity);
  transition: opacity 200ms;
  transition-delay: var(--delay);
}
</style>
