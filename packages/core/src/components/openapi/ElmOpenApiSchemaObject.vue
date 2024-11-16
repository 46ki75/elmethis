<template>
  <div :class="$style.normal">
    <ElmOpenApiSchemaObjectType
      v-if="typeof schema.type === 'string'"
      :type="schema.type"
      :name="name"
    />

    <template v-else-if="Array.isArray(schema.type)">
      <ElmOpenApiSchemaObjectType
        v-for="type in schema.type"
        :type="type"
        :name="name"
      />
    </template>

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
import { type OpenAPIV3_1 } from 'openapi-types'

import ElmInlineText from '../inline/ElmInlineText.vue'
import ElmOpenApiSchemaObjectType from './ElmOpenApiSchemaObjectType.vue'

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
</style>
