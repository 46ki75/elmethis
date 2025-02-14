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

      <template
        v-if="schema.type === 'string' || schema.type?.includes('string')"
      >
        <!-- minLength -->

        <ElmFieldAttribute
          v-if="schema.minLength != null"
          icon="fluent-mdl2:minimum-value"
          name="MinLength"
          :content="String(schema.minLength)"
        />

        <!-- maxLength -->

        <ElmFieldAttribute
          v-if="schema.maxLength != null"
          icon="fluent-mdl2:maximum-value"
          name="MaxLength"
          :content="String(schema.maxLength)"
        />
      </template>

      <!-- 
      
      // # --------------------------------------------------------------------------------
      //
      // Attributes number | integer
      //
      // # --------------------------------------------------------------------------------
      
      -->

      <template
        v-if="
          schema.type === 'number' ||
          schema.type === 'integer' ||
          schema.type?.includes('number') ||
          schema.type?.includes('integer')
        "
      >
        <!-- multipleOf -->

        <ElmFieldAttribute
          v-if="schema.multipleOf != null"
          icon="stash:times-light"
          name="MultipleOf"
          :content="String(schema.multipleOf)"
        />

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

        <!-- exclusiveMinimum -->

        <ElmFieldAttribute
          v-if="schema.exclusiveMinimum != null"
          icon="mingcute:arrow-to-down-line"
          name="ExclusiveMinimum"
          :content="String(schema.exclusiveMinimum)"
        />

        <!-- exclusiveMaximum -->

        <ElmFieldAttribute
          v-if="schema.exclusiveMaximum != null"
          icon="mingcute:arrow-to-up-line"
          name="ExclusiveMaximum"
          :content="String(schema.exclusiveMaximum)"
        />
      </template>

      <!-- 
      
      // # --------------------------------------------------------------------------------
      //
      // Attributes object
      //
      // # --------------------------------------------------------------------------------
      
      -->

      <template
        v-if="schema.type === 'object' || schema.type?.includes('object')"
      >
        <!-- required -->

        <ElmFieldAttribute
          v-if="schema.required != null"
          icon="material-symbols:asterisk"
          name="Required"
          :content="String(schema.required.join(', '))"
        />

        <!-- additionalProperties -->

        <ElmFieldAttribute
          v-if="schema.additionalProperties == null"
          icon="tabler:tag-plus"
          name="AdditionalProperties"
          content="Allow (Implicit)"
        />

        <ElmFieldAttribute
          v-else-if="
            typeof schema.additionalProperties === 'boolean' &&
            schema.additionalProperties === true
          "
          icon="tabler:tag-plus"
          name="AdditionalProperties"
          content="Allow"
        />

        <ElmFieldAttribute
          v-else-if="
            typeof schema.additionalProperties === 'boolean' &&
            schema.additionalProperties === false
          "
          icon="tabler:tag-plus"
          name="AdditionalProperties"
          content="Disallow"
        />
      </template>
    </div>

    <div>
      <ElmChildContainer
        v-if="
          schema.items != null &&
          (schema.type === 'array' || schema.type?.includes('array'))
        "
        icon="qlementine-icons:items-list-16"
        text="Items"
      >
        <ElmJsonSchema
          v-if="Array.isArray(schema.items)"
          :class="$style.nested"
          v-for="item in schema.items"
          :schema="item"
        />

        <ElmJsonSchema v-else :schema="schema.items" />
      </ElmChildContainer>

      <ElmChildContainer
        v-if="schema.type === 'object' || schema.type?.includes('object')"
        icon="tabler:tag"
        text="Properties"
      >
        <ElmJsonSchema
          v-for="key in Object.keys(schema.properties || {})"
          v-if="schema.properties != null"
          :name="key"
          :schema="schema.properties[key]"
        />
      </ElmChildContainer>

      <ElmChildContainer
        v-if="
          (schema.type === 'object' || schema.type?.includes('object')) &&
          schema.additionalProperties != null &&
          !isBoolean(schema.additionalProperties)
        "
        icon="tabler:tag-plus"
        text="AdditionalProperties"
      >
        <ElmJsonSchema :schema="schema.additionalProperties" />
      </ElmChildContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type JSONSchema7Definition } from 'json-schema'

import ElmInlineText from '../inline/ElmInlineText.vue'
import ElmFieldType from './ElmFieldType.vue'
import ElmFieldAttribute from './ElmFieldAttribute.vue'
import ElmChildContainer from './ElmChildContainer.vue'

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
</style>
