<template>
  <div :class="$style.normal">
    <div
      :class="[
        $style['column-type-name'],
        {
          [$style.string]: schema.type === 'string',
          [$style.number]: schema.type === 'number',
          [$style.boolean]: schema.type === 'boolean',
          [$style.null]: schema.type === 'null',
          [$style.array]: schema.type === 'array',
          [$style.object]: schema.type === 'object'
        }
      ]"
    >
      <span :class="$style['column-type']">
        <Icon
          :class="$style.icon"
          :icon="
            schema.type === 'boolean'
              ? 'stash:data-boolean'
              : schema.type === 'string'
                ? 'icon-park-outline:text'
                : schema.type === 'number'
                  ? 'icon-park-outline:hashtag-key'
                  : schema.type === 'null'
                    ? 'mdi:null-off'
                    : schema.type === 'array'
                      ? 'ic:baseline-data-array'
                      : schema.type === 'object'
                        ? 'carbon:object'
                        : ''
          "
        />
        <ElmInlineText :text="String(schema.type)" />
      </span>

      <div v-if="name" :class="$style['column-name']">
        <ElmInlineText :text="name" />
      </div>
    </div>

    <div>
      <ElmInlineText :text="schema.description ?? 'No enum provided.'" />
    </div>

    <div v-if="schema.type === 'array'" :class="$style.nested">
      <ElmOpenApiSchemaObject :schema="schema.items" />
    </div>

    <div v-if="schema.type === 'object'" :class="$style.nested">
      <ElmOpenApiSchemaObject
        v-for="key in Object.keys(schema.properties || {})"
        :name="key"
        :schema="schema.properties![key]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { OpenAPIV3_1 } from 'openapi-types'
import { Icon } from '@iconify/vue'
import ElmInlineText from '../inline/ElmInlineText.vue'

export interface ElmOpenApiProps {
  name?: string
  schema: OpenAPIV3_1.SchemaObject
}

withDefaults(defineProps<ElmOpenApiProps>(), {})
</script>

<style module lang="scss">
.normal {
  box-sizing: border-box;
  padding-left: 0.5rem;

  display: flex;
  flex-direction: column;

  border-left: solid 0.125rem rgba(black, 0.125);

  [data-theme='dark'] & {
    border-color: rgba(white, 0.125);
  }
}

.nested {
  padding-left: 1.5rem;
  padding-block-start: 0.5rem;
}

.icon {
  color: rgba(black, 0.8);
  [data-theme='dark'] & {
    color: rgba(white, 0.8);
  }
}

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
  }

  .column-name {
    padding-inline: 0.5rem;
    font-family: ui-monospace, monospace;
    margin: auto 0;
  }
}
</style>
