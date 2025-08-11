<template>
  <div :class="$style.wrapper">
    <ElmInlineText :text="title" size="1.3rem" bold />
    <ElmInlineText :text="description" />
    <ElmTextField :label="label" v-model="username" icon="lock" />
    <ElmButton block primary @click="next">
      <ElmMdiIcon :d="mdiChevronRightCircle" color="gray" />
      <span>Next</span>
    </ElmButton>
  </div>
</template>

<script setup lang="ts">
import {
  ElmButton,
  ElmInlineText,
  ElmMdiIcon,
  ElmTextField,
} from "@elmethis/core";
import { State } from "../ElmCognito.vue";
import { mdiChevronRightCircle } from "@mdi/js";

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

const state = defineModel<State>("state");
const username = defineModel<string>("username", { default: "" });

const next = () => {
  state.value = "SIGN_IN_PASSWORD";
};
</script>

<style module lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
