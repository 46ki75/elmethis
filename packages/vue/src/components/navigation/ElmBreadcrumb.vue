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
                ? mdiApplicationOutline
                : mdiFolderOpen
          "
          size="1.25em"
          :class="$style.text"
          :style="{
            '--delay': `${index * 100}ms`,
          }"
        />
        <ElmInlineText
          :text="link.text"
          :class="$style.text"
          :style="{
            '--delay': `${index * 100 + 50}ms`,
          }"
        />
      </div>

      <ElmMdiIcon
        v-if="links.length !== index + 1"
        :d="mdiChevronRight"
        size="1em"
        color="#b69545"
        :class="$style.text"
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
  mdiApplicationOutline,
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
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  user-select: none;
}

.link-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0;
  box-sizing: border-box;
  padding: 0.25rem;
  border-radius: 0.25rem;
  cursor: pointer;

  transition:
    background-color 100ms,
    opacity 100ms,
    transform 100ms;

  &:hover {
    background-color: rgba(#868e9c, 0.2);
    transform: translateX(-1px) translateY(-1px);
  }

  &:active {
    opacity: 0.5;
    transform: translateX(1px) translateY(1px);
  }
}

.text {
  opacity: var(--opacity);
  transition: opacity 200ms;
  transition-delay: var(--delay);
  padding: 0 0.25rem;
}
</style>
