<template>
  <a
    class="link"
    :href="href"
    :target="openInNewTab ? '_blank' : undefined"
    rel="noopener noreferrer"
    @click="handleClick"
  >
    {{ text }}
    <component
      :is="
        iconType != null
          ? iconType === 'internal'
            ? ChevronRightIcon
            : ArrowTopRightOnSquareIcon
          : openInNewTab
            ? ArrowTopRightOnSquareIcon
            : ChevronRightIcon
      "
      class="icon"
    />
  </a>
</template>

<script setup lang="ts">
import {
  ArrowTopRightOnSquareIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

const props = withDefaults(
  defineProps<{
    /**
     * The text to display.
     */
    text?: string

    /**
     * The URL to navigate to.
     *
     * e.g. `https://example.com`
     */
    href?: string

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
  }>(),
  {
    openInNewTab: true
  }
)

function handleClick(event: MouseEvent) {
  if (props.onClick) {
    event.preventDefault()
    props.onClick()
  }
}
</script>

<style scoped lang="scss">
.link {
  all: unset;
  box-sizing: border-box;
  padding: 0 0.25rem;
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
    width: 16px;
  }
}
</style>
