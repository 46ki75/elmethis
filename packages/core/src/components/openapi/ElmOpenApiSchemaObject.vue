<template>
  <div v-if="schema.type === 'boolean'" :class="$style.normal">
    <div>Type: boolean</div>
    <div>Name: {{ name }}</div>
    <div>
      Description: {{ schema.description ?? 'No description provided.' }}
    </div>
  </div>

  <div v-else-if="schema.type === 'string'" :class="$style.normal">
    <div>Type: string</div>
    <div>Name: {{ name }}</div>
    <div>
      Description: {{ schema.description ?? 'No description provided.' }}
    </div>
  </div>

  <div v-else-if="schema.type === 'number'" :class="$style.normal">
    <div>Type: Number</div>
    <div>Name: {{ name }}</div>
    <div>
      Description: {{ schema.description ?? 'No description provided.' }}
    </div>
  </div>

  <div v-else-if="schema.type === 'array'" :class="$style.normal">
    <div>Type: Array</div>
    <div>Name: {{ name }}</div>
    <div style="padding-left: 1rem">
      <ElmOpenApiSchemaObject :name="''" :schema="schema.items" />
    </div>
  </div>

  <div v-else-if="schema.type === 'object'" :class="$style.normal">
    <div>Type: object</div>
    <div>Name: {{ name }}</div>
    <div style="padding-left: 1rem">
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

export interface ElmOpenApiProps {
  name: string
  schema: OpenAPIV3_1.SchemaObject
}

withDefaults(defineProps<ElmOpenApiProps>(), {})
</script>

<style module lang="scss">
.normal {
  box-sizing: border-box;
  padding: 0.25rem;
  border: solid 1px rgba(black, 0.6);
  [data-theme='dark'] & {
    border-color: rgba(white, 0.6);
  }
}
</style>
