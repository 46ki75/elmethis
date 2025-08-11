<template>
  <div>
    <h2><ElmInlineText :text="title" /></h2>
    <ElmTextField :label="label" v-model="password" icon="user" />
  </div>
</template>

<script setup lang="ts">
import { ElmInlineText, ElmTextField } from "@elmethis/core";

export interface ElmAuthSignInPasswordProps {
  title?: string;
  label?: string;
}

withDefaults(defineProps<ElmAuthSignInPasswordProps>(), {
  title: "Enter your password",
  label: "Password",
});

const password = defineModel<string>("password", { default: "" });
</script>

<style module lang="scss"></style>
