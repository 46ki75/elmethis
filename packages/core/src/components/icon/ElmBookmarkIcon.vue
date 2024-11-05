<template>
  <a
    :class="$style.wrapper"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img
      v-if="favicon != null"
      :class="$style.favicon"
      :src="favicon"
      :alt="`favicon of ${name ?? href}`"
    />

    <GlobeAsiaAustraliaIcon v-else :class="$style['favicon-svg']" />

    <div :class="$style.text">
      <ElmInlineText :text="name ?? href" size=".6rem" />
    </div>
  </a>
</template>

<script setup lang="ts">
import { GlobeAsiaAustraliaIcon } from '@heroicons/vue/24/outline'
import ElmInlineText from '../inline/ElmInlineText.vue'

export interface ElmBookmarkIconProps {
  name?: string

  href: string

  favicon?: string
}

withDefaults(defineProps<ElmBookmarkIconProps>(), {})
</script>

<style module lang="scss">
.wrapper {
  all: unset;
  box-sizing: border-box;
  padding: 0.5rem;
  width: 5rem;
  height: 5.5rem;
  border-radius: 0.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  cursor: pointer;
  transition: background-color 100ms;
  &:hover {
    background-color: rgba(black, 0.1);
    [data-theme='dark'] & {
      background-color: rgba(white, 0.1);
    }
  }
}

.favicon {
  width: 2.5rem;
  height: 2.5rem;
}

.favicon-svg {
  width: 2.5rem;
  height: 2.5rem;
  color: rgba(black, 0.7);
  [data-theme='dark'] & {
    color: rgba(white, 0.7);
  }
}

.text {
  width: 4rem;
  text-align: center;
  vertical-align: middle;
  line-height: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
