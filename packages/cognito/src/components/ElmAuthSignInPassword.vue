<template>
  <div :class="$style.wrapper">
    <ElmInlineText :text="title" size="1.3rem" bold />
    <div :class="$style.center">
      <ElmMdiIcon :d="mdiEmail" color="gray" />
      <ElmInlineText :text="email" />
    </div>
    <ElmTextField :label="label" v-model="password" is-password icon="lock" />

    <div :class="$style['button-container']">
      <ElmButton block primary @click="">
        <ElmMdiIcon :d="mdiSend" color="gray" />
        <span>Submit</span>
      </ElmButton>
      <ElmButton block @click="() => (state = 'SIGN_IN')">
        <ElmMdiIcon :d="mdiChevronLeftCircle" color="gray" />
        <span>Back</span>
      </ElmButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ElmInlineText,
  ElmTextField,
  ElmButton,
  ElmMdiIcon,
} from "@elmethis/core";
import { State } from "../ElmCognito.vue";
import { mdiEmail, mdiSend, mdiChevronLeftCircle } from "@mdi/js";

export interface ElmAuthSignInPasswordProps {
  title?: string;
  label?: string;
}

withDefaults(defineProps<ElmAuthSignInPasswordProps>(), {
  title: "Enter your password",
  label: "Password",
});

const state = defineModel<State>("state");
const email = defineModel<string>("email", { default: "" });
const password = defineModel<string>("password", { default: "" });
</script>

<style module lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.center {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
