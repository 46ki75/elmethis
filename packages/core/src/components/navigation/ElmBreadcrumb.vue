<template>
  <nav
    :class="$style.container"
    ref="target"
    :style="{
      '--opacity': targetIsVisible ? 1 : 0,
    }"
  >
    <template v-for="(link, index) in links">
      <div :class="$style['link-container']" @click="link.onClick">
        <ElmMdiIcon
          :d="
            index === 0
              ? mdiHome
              : index === links.length - 1
                ? mdiFileDocument
                : mdiFolderOpen
          "
          size="1.25em"
          :class="$style.fade"
          :style="{
            '--delay': `${index * 100}ms`,
          }"
        />
        <ElmInlineText
          :text="link.text"
          :class="$style.fade"
          :style="{
            '--delay': `${index * 100 + 50}ms`,
          }"
        />
      </div>

      <ElmMdiIcon
        v-if="links.length !== index + 1"
        :d="mdiChevronRight"
        size="1em"
        color="gray"
        :class="$style.fade"
        :style="{ '--delay': `${index * 100 + 100}ms` }"
      />
    </template>
  </nav>
</template>

<script setup lang="ts">
import ElmInlineText from "../typography/ElmInlineText.vue";
import { ref } from "vue";
import { useIntersectionObserver } from "@vueuse/core";

import ElmMdiIcon from "../icon/ElmMdiIcon.vue";
import {
  mdiChevronRight,
  mdiFileDocument,
  mdiFolderOpen,
  mdiHome,
} from "@mdi/js";

export interface ElmBreadcrumbProps {
  /**
   * The links to display.
   */
  links: Array<{
    /**
     * The text to display.
     */
    text: string;

    /**
     * The action to perform when the link is clicked.
     */
    onClick?: () => void;
  }>;
}

withDefaults(defineProps<ElmBreadcrumbProps>(), {});

const target = ref(null);
const targetIsVisible = ref(false);

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  targetIsVisible.value = isIntersecting;
});
</script>

<style module lang="scss">
.container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  user-select: none;

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
