<template>
  <div :class="$style.normal">
    <div :class="$style['column-info']">
      <span
        :class="{
          [$style.string]: schema.type === 'string',
          [$style.number]: schema.type === 'number',
          [$style.boolean]: schema.type === 'boolean',
          [$style.null]: schema.type === 'null',
          [$style.array]: schema.type === 'array',
          [$style.object]: schema.type === 'object'
        }"
      >
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

      <span v-if="name" :class="$style['column-name']">
        <ElmInlineText :text="name" />
      </span>
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

.column-info {
  width: min-content;
  display: flex;
  gap: 0.5rem;
  margin-block: 0.5rem;
  border: solid 1px #a0d4b4;
}

.column-name {
  display: inline-block;
  border-radius: 0.25rem;
  font-family: ui-monospace, monospace;
  margin: auto 0;
  vertical-align: middle;
}

@mixin type($color) {
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 0.125rem;
  background-color: $color;
}

.string {
  @include type(rgba(#a0d4b4, 0.5));
}

.number {
  @include type(rgba(#aebed9, 0.5));
}

.boolean {
  @include type(rgba(#cab7dd, 0.5));
}

.null {
  @include type(rgba(#bec2ca, 0.5));
}

.array {
  @include type(rgba(#e4b4ce, 0.5));
}

.object {
  @include type(rgba(#e9dec5, 0.5));
}
</style>
