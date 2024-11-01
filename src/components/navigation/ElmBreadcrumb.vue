<template>
  <nav class="container">
    <template v-for="(link, index) in links">
      <div class="link-container" @click="link.onClick">
        <component
          class="icon"
          :is="
            index === 0
              ? HomeIcon
              : index === links.length - 1
                ? FolderOpenIcon
                : DocumentTextIcon
          "
        />
        <ElmInlineText :text="link.text" class="link-text" />
      </div>
      <ChevronRightIcon v-if="links.length !== index + 1" class="chevron" />
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

export interface ElmBreadcrumbProps {
  links: Array<{
    text: string
    onClick?: () => void
  }>
}

withDefaults(defineProps<ElmBreadcrumbProps>(), {})
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
</style>
