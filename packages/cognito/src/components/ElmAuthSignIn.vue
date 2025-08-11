<template>
  <div>
    <h2><ElmInlineText :text="title" /></h2>
    <ElmParagraph><ElmInlineText :text="description" /></ElmParagraph>
    <ElmTextField :label="label" v-model="username" icon="user" />
  </div>
</template>

<script setup lang="ts">
import { ElmInlineText, ElmParagraph, ElmTextField } from "@elmethis/core";

export interface ElmAuthSignInEmailProps {
  title?: string;
  description?: string;
  label?: string;
}

withDefaults(defineProps<ElmAuthSignInEmailProps>(), {
  title: "Sign in",
  description: "Sign in to your account.",
  label: "Username",
});

const username = defineModel<string>("username", { default: "" });
</script>

<style module lang="scss"></style>
