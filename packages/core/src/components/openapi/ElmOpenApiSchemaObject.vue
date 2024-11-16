<template>
  <div v-if="schema.type === 'boolean'" :class="$style.normal">
    <div :class="$style['column-name']">
      <span :class="$style.boolean">
        <Icon icon="stash:data-boolean" :class="$style.icon" />
        <ElmInlineText text="Boolean" />
      </span>
      <ElmInlineText v-if="name" :text="name" />
    </div>

    <div>
      <ElmInlineText :text="schema.description ?? 'No enum provided.'" />
    </div>
  </div>

  <div v-else-if="schema.type === 'string'" :class="$style.normal">
    <div :class="$style['column-name']">
      <span :class="$style.string">
        <Icon icon="icon-park-outline:text" :class="$style.icon" />
        <ElmInlineText text="String" />
      </span>
      <ElmInlineText v-if="name" :text="name" />
    </div>

    <div>
      <ElmInlineText :text="schema.description ?? 'No enum provided.'" />
    </div>
  </div>

  <div v-else-if="schema.type === 'number'" :class="$style.normal">
    <div :class="$style['column-name']">
      <span :class="$style.number">
        <Icon icon="icon-park-outline:hashtag-key" :class="$style.icon" />
        <ElmInlineText text="Number" />
      </span>
      <ElmInlineText v-if="name" :text="name" />
    </div>

    <div>
      <ElmInlineText :text="schema.description ?? 'No enum provided.'" />
    </div>
  </div>

  <div v-else-if="schema.type === 'null'" :class="$style.normal">
    <div :class="$style['column-name']">
      <span :class="$style.null">
        <Icon icon="mdi:null-off" :class="$style.icon" />
        <ElmInlineText text="Null" />
      </span>
      <ElmInlineText v-if="name" :text="name" />
    </div>

    <div>
      <ElmInlineText :text="schema.description ?? 'No enum provided.'" />
    </div>
  </div>

  <div v-else-if="schema.type === 'array'" :class="$style.normal">
    <div :class="$style['column-name']">
      <span :class="$style.array">
        <Icon icon="ic:baseline-data-array" :class="$style.icon" />
        <ElmInlineText text="Array" />
      </span>
      <ElmInlineText v-if="name" :text="name" />
    </div>

    <div style="padding-left: 2rem">
      <ElmOpenApiSchemaObject :schema="schema.items" />
    </div>
  </div>

  <div v-else-if="schema.type === 'object'" :class="$style.normal">
    <div :class="$style['column-name']">
      <span :class="$style.object">
        <Icon icon="carbon:object" :class="$style.icon" />
        <ElmInlineText text="Object" />
      </span>
      <ElmInlineText v-if="name" :text="name" />
    </div>

    <div>
      <ElmInlineText :text="schema.description ?? 'No enum provided.'" />
    </div>

    <div style="padding-left: 2rem">
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
  padding: 0.75rem;
  padding-right: 0;
  padding-bottom: 0;
  border-left: solid 0.125rem rgba(black, 0.125);
  [data-theme='dark'] & {
    border-color: rgba(white, 0.125);
  }
}

.icon {
  color: rgba(black, 0.8);
  [data-theme='dark'] & {
    color: rgba(white, 0.8);
  }
}

.column-name {
  display: flex;
  gap: 0.5rem;
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
