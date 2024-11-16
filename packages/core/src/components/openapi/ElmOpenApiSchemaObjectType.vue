<template>
  <div
    :class="[
      $style['column-type-name'],
      {
        [$style.string]: type === 'string',
        [$style.number]: type === 'number',
        [$style.boolean]: type === 'boolean',
        [$style.null]: type === 'null',
        [$style.array]: type === 'array',
        [$style.object]: type === 'object'
      }
    ]"
  >
    <span :class="$style['column-type']">
      <Icon :class="$style.icon" :icon="getIconForType(type)" />
      <ElmInlineText :text="`${type}${nullable ? ' ?' : ''}`" />
    </span>

    <div v-if="name" :class="$style['column-name']">
      <ElmInlineText :text="name" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OpenAPIV3_1 } from 'openapi-types'
import { Icon } from '@iconify/vue'
import ElmInlineText from '../inline/ElmInlineText.vue'

export interface ElmOpenApiSchemaObjectTypeProps {
  type: 'array' | OpenAPIV3_1.NonArraySchemaObjectType
  name?: string
  nullable?: boolean
}

withDefaults(defineProps<ElmOpenApiSchemaObjectTypeProps>(), {})

function getIconForType(type: string) {
  switch (type) {
    case 'boolean':
      return 'carbon:boolean'
    case 'string':
      return 'icon-park-outline:text'
    case 'number':
      return 'icon-park-outline:hashtag-key'
    case 'null':
      return 'ph:empty'
    case 'array':
      return 'ic:baseline-data-array'
    case 'object':
      return 'carbon:object'
    default:
      return ''
  }
}
</script>

<style module lang="scss">
.column-type-name {
  display: flex;
  align-items: stretch;
  justify-content: stretch;

  width: min-content;
  border-radius: 0.25rem;
  margin-block: 0.5rem;
  white-space: nowrap;

  &.string {
    border: solid 1px rgba(#a0d4b4, 0.5);
    .column-type {
      background-color: rgba(#a0d4b4, 0.5);
    }
  }

  &.number {
    border: solid 1px rgba(#aebed9, 0.5);
    .column-type {
      background-color: rgba(#aebed9, 0.5);
    }
  }

  &.boolean {
    border: solid 1px rgba(#cab7dd, 0.5);
    .column-type {
      background-color: rgba(#cab7dd, 0.5);
    }
  }

  &.null {
    border: solid 1px rgba(#bec2ca, 0.5);
    .column-type {
      background-color: rgba(#bec2ca, 0.5);
    }
  }

  &.array {
    border: solid 1px rgba(#e4b4ce, 0.5);
    .column-type {
      background-color: rgba(#e4b4ce, 0.5);
    }
  }

  &.object {
    border: solid 1px rgba(#e9dec5, 0.5);
    .column-type {
      background-color: rgba(#e9dec5, 0.5);
    }
  }

  .column-type {
    padding-inline-start: 0.25rem;
    padding-inline-end: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .icon {
      width: 20px;
      height: 20px;
      color: rgba(black, 0.7);
      [data-theme='dark'] & {
        color: rgba(white, 0.7);
      }
    }
  }

  .column-name {
    padding-inline: 0.5rem;
    font-family: ui-monospace, monospace;
    margin: auto 0;
  }
}
</style>
