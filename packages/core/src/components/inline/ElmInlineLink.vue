<template>
  <a
    :class="$style.link"
    :href="href"
    :style="{ '--font-size': size }"
    :target="openInNewTab ? '_blank' : undefined"
    rel="noopener noreferrer"
    @click="handleClick"
  >
    <img
      v-if="favicon"
      :src="favicon"
      alt="favicon"
      @error="handleError"
      :class="$style.icon"
    />

    {{ text ?? href }}
    <Icon
      :icon="
        iconType != null
          ? iconType === 'internal'
            ? 'mdi:chevron-right'
            : 'mdi:external-link'
          : openInNewTab
            ? 'mdi:external-link'
            : 'mdi:chevron-right'
      "
      :class="$style.icon"
    />
  </a>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Property } from 'csstype'
import { ref } from 'vue'

export interface ElmInlineLinkProps {
  /**
   * The text to display.
   */
  text?: string

  /**
   * The URL to navigate to.
   *
   * e.g. `https://example.com`
   */
  href: string

  favicon?: string

  /**
   * Specifies the font size of the text.
   */
  size?: Property.FontSize

  /**
   * Whether to open the link in a new tab.
   * Defaults to `true`.
   */
  openInNewTab?: boolean

  /**
   * The type of icon to display.
   * If not provided, the icon is determined by the `openInNewTab` prop.
   */
  iconType?: 'internal' | 'external'

  /**
   * The function to call when the link is clicked.
   * If provided, the default behavior (navigating to the URL) is prevented.
   */
  onClick?: () => void
}

const props = withDefaults(defineProps<ElmInlineLinkProps>(), {
  openInNewTab: true,
  size: '1rem'
})

function handleClick(event: MouseEvent) {
  if (props.onClick) {
    event.preventDefault()
    props.onClick()
  }
}

const handleError = () => {
  src.value = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="gray" d="M17.9 17.39c-.26-.8-1.01-1.39-1.9-1.39h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2v-.41a7.984 7.984 0 0 1 2.9 12.8M11 19.93c-3.95-.49-7-3.85-7-7.93c0-.62.08-1.22.21-1.79L9 15v1a2 2 0 0 0 2 2m1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"/></svg>`
}
</script>

<style module lang="scss">
.link {
  all: unset;
  box-sizing: border-box;
  padding: 0 0.25rem;
  font-size: var(--font-size);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  color: #6987b8;
  border-radius: 0.125rem 0.125rem 0 0;
  border-bottom: dashed 1px #6987b8;
  transition:
    background-color 200ms,
    color 200ms;

  &:hover {
    background-color: rgba($color: #6987b8, $alpha: 0.2);
  }

  &:active {
    color: #59b57c;
    background-color: rgba($color: #59b57c, $alpha: 0.2);
  }

  &:visited {
    color: #9771bd;
    border-bottom: dashed 1px #9771bd;

    &:hover {
      background-color: rgba($color: #9771bd, $alpha: 0.2);
    }

    &:active {
      color: #59b57c;
      background-color: rgba($color: #59b57c, $alpha: 0.2);
    }
  }

  .icon {
    width: var(--font-size);
    height: var(--font-size);
  }
}
</style>
