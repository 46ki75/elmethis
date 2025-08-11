<template>
  <div>
    <ElmAuthSignIn v-if="state === 'SIGN_IN'" v-model:username="username" />
    <ElmAuthSignInPassword
      v-if="state === 'SIGN_UP'"
      v-model:password="password"
    />
  </div>
</template>

<script setup lang="ts">
import ElmAuthSignIn from "./components/ElmAuthSignIn.vue";
import ElmAuthSignInPassword from "./components/ElmAuthSignInPassword.vue";

export interface ElmCognitoProps {}

withDefaults(defineProps<ElmCognitoProps>(), {});

export type State = "SIGN_IN" | "SIGN_UP";

const state = defineModel<State>({ default: "SIGN_IN" });
const username = defineModel<string>("username", { default: "" });
const password = defineModel<string>("password", { default: "" });
</script>

<style module lang="scss"></style>
