<template>
  <table
    :class="$style.table"
    :style="{
      '--margin-block': margin,
    }"
  >
    <caption v-if="caption != null">
      <span :class="$style['caption']">
        <span :class="$style.spacing"></span>

        <span :class="$style['caption-inner']">
          <svg viewBox="0 0 24 24" width="1rem" height="1rem">
            <path :d="mdiTable" fill="#6987b8" />
          </svg>
          <ElmInlineText :text="caption" />
        </span>

        <span :class="$style.spacing"></span>
      </span>
    </caption>

    <slot v-if="slots.header != null" name="header" />
    <slot name="body" />
  </table>
</template>

<script setup lang="ts">
import ElmTableHeader from "./ElmTableHeader.vue";
import ElmTableBody from "./ElmTableBody.vue";

import type { Property } from "csstype";
import { defineSlots, provide } from "vue";
import ElmInlineText from "../typography/ElmInlineText.vue";

import { mdiTable } from "@mdi/js";

export interface ElmTableProps {
  /**
   * The margin of the table.
   */
  margin?: Property.MarginBlock;

  caption?: string;

  hasRowHeader?: boolean;
}

const props = withDefaults(defineProps<ElmTableProps>(), {
  hasRowHeader: false,
});

provide("hasRowHeader", props.hasRowHeader);

const slots = defineSlots<{
  /**
   * (Optional) The header slot of the table.
   */
  header?: InstanceType<typeof ElmTableHeader>;

  /**
   * The body slot of the table.
   */
  body: InstanceType<typeof ElmTableBody>;
}>();
</script>

<style module lang="scss">
.table {
  margin-block: var(--margin-block);
  border-collapse: collapse;
  border-spacing: 0;
  box-shadow: 0 0 0.125rem rgba(black, 0.2);

  color: rgba(black, 0.7);

  [data-theme="dark"] & {
    color: rgba(white, 0.7);
  }
}

.caption {
  position: relative;
  width: 100%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-block-end: 1rem;
}

.caption-inner {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
}

.spacing {
  flex-grow: 1;
  height: 1px;
  background-color: rgba(gray, 0.2);
}
</style>
