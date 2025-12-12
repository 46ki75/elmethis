<template>
  <component
    :is="hasHeader || hasHeaderInjected ? 'th' : 'td'"
    :class="[
      $style.common,
      hasHeader || hasHeaderInjected ? $style.th : $style.td,
    ]"
  >
    <slot v-if="text == null" />
    {{ text }}
  </component>
</template>

<script setup lang="ts">
import { inject, type VNodeChild } from "vue";

export interface ElmTableCellProps {
  /**
   * Whether the cell is a header cell.
   */
  hasHeader?: boolean;

  /**
   * The text content of the cell.
   * If not provided, the cell will render its children as content.
   */
  text?: string;
}

withDefaults(defineProps<ElmTableCellProps>(), {
  hasHeader: false,
});

defineSlots<{
  default: VNodeChild;
}>();

const hasHeaderInjected = inject<boolean>("hasHeader");
</script>

<style module lang="scss">
.common {
  padding: 0.75rem 1rem;

  color: rgba(black, 0.7);

  border-right: 1px dotted rgba(black, 0.15);

  &::selection {
    color: rgba(white, 0.7);
    background-color: rgba(black, 0.7);
  }

  [data-theme="dark"] & {
    color: rgba(white, 0.7);

    &::selection {
      color: rgba(black, 0.7);
      background-color: rgba(white, 0.7);
    }
  }

  [data-theme="dark"] & {
    border-right: 1px dotted rgba(white, 0.15);
  }

  &:last-child {
    border-right: none;
  }
}

.td {
  border-top: 1px solid rgba(black, 0.15);

  [data-theme="dark"] & {
    border-top-color: rgba(white, 0.15);
  }
}

.th {
  background-color: rgba(gray, 0.15);
}
</style>
