<template>
  <div :class="$style.normal" v-if="!isBoolean(schema)">
    <ElmFieldType
      v-if="typeof schema.type === 'string'"
      :type="schema.type"
      :name="name"
    />

    <template v-else-if="Array.isArray(schema.type)">
      <ElmFieldType v-for="type in schema.type" :type="type" :name="name" />
    </template>

    <div>
      <ElmInlineText :text="schema.description ?? 'No description provided.'" />
    </div>

    <!-- enum -->

    <div v-if="schema.enum != null">
      <ElmFieldAttribute
        icon="gg:list"
        name="Enum"
        :content="schema.enum.join(', ')"
      />
    </div>

    <template v-if="schema.items != null && schema.type === 'array'">
      <div
        v-if="Array.isArray(schema.items)"
        :class="$style.nested"
        v-for="item in schema.items"
      >
        <ElmJsonSchema :schema="item" />
      </div>

      <div v-else :class="$style.nested">
        <ElmJsonSchema :schema="schema.items" />
      </div>
    </template>

    <template v-if="schema.type === 'object'">
      <div>
        Required:
        <ElmInlineText
          :text="schema.required != null ? schema.required.join(',') : '[]'"
        />
      </div>

      <div :class="$style.nested">
        <ElmJsonSchema
          v-for="key in Object.keys(schema.properties || {})"
          v-if="schema.properties != null"
          :name="key"
          :schema="schema.properties[key]"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { type JSONSchema7Definition } from 'json-schema'

import ElmInlineText from '../inline/ElmInlineText.vue'
import ElmFieldType from './ElmFieldType.vue'
import ElmFieldAttribute from './ElmFieldAttribute.vue'

export interface ElmJsonSchemaProps {
  name?: string
  schema: JSONSchema7Definition
}

withDefaults(defineProps<ElmJsonSchemaProps>(), {})

function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean'
}
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
