<template>
  <div :class="$style.wrapper" v-if="!isBoolean(schema)">
    <ElmFieldType
      v-if="typeof schema.type === 'string'"
      :type="schema.type"
      :name="name"
    />

    <template v-else-if="Array.isArray(schema.type)">
      <ElmFieldType v-for="type in schema.type" :type="type" :name="name" />
    </template>

    <div :class="$style.description">
      <ElmInlineText :text="schema.description ?? 'No description provided.'" />
    </div>

    <div :class="$style.attributes">
      <!-- enum -->

      <ElmFieldAttribute
        v-if="schema.enum != null"
        icon="gg:list"
        name="Enum"
        :content="schema.enum.join(', ')"
      />

      <!-- const -->

      <ElmFieldAttribute
        v-if="schema.const != null"
        icon="ic:baseline-gps-not-fixed"
        name="const"
        :content="String(schema.const)"
      />

      <!-- default -->

      <ElmFieldAttribute
        v-if="schema.default != null"
        icon="material-symbols:circle-outline"
        name="const"
        :content="String(schema.default)"
      />

      <!-- 
      
      // # --------------------------------------------------------------------------------
      //
      // Attributes string
      //
      // # --------------------------------------------------------------------------------
      
      -->

      <template v-if="schema.type === 'string'">
        <!-- pattern -->

        <ElmFieldAttribute
          v-if="schema.pattern != null"
          icon="mdi:regex"
          name="pattern"
          :content="String(schema.pattern)"
        />
      </template>

      <!-- 
      
      // # --------------------------------------------------------------------------------
      //
      // Attributes number | integer
      //
      // # --------------------------------------------------------------------------------
      
      -->

      <template v-if="schema.type === 'number' || schema.type === 'integer'">
        <!-- minimum -->

        <ElmFieldAttribute
          v-if="schema.minimum != null"
          icon="mingcute:arrow-to-down-line"
          name="minimum"
          :content="String(schema.minimum)"
        />

        <!-- maximum -->

        <ElmFieldAttribute
          v-if="schema.maximum != null"
          icon="mingcute:arrow-to-up-line"
          name="maximum"
          :content="String(schema.maximum)"
        />
      </template>

      <!-- 
      
      // # --------------------------------------------------------------------------------
      //
      // Attributes object
      //
      // # --------------------------------------------------------------------------------
      
      -->

      <template v-if="schema.type === 'object'">
        <!-- required -->

        <ElmFieldAttribute
          v-if="schema.required != null"
          icon="material-symbols:asterisk"
          name="Required"
          :content="String(schema.required.join(', '))"
        />
      </template>
    </div>

    <div>
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
.wrapper {
  box-sizing: border-box;
  padding-left: 0.5rem;
  margin-block: 0.75rem;

  display: flex;
  flex-direction: column;

  border-left: solid 0.125rem rgba(black, 0.125);
  transition: background-color 200ms;

  [data-theme='dark'] & {
    border-color: rgba(white, 0.125);
  }

  &:hover {
    background-color: rgba(#6987b8, 0.05);
  }
}

.description {
  padding-block-end: 0.5rem;
  opacity: 0.8;
}

.attributes {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
}

.nested {
  padding-left: 1.5rem;
}
</style>
