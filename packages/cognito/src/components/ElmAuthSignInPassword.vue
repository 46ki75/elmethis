<template>
  <div :class="$style.wrapper">
    <ElmInlineText :text="title" size="1.3rem" bold />
    <div :class="$style.flex">
      <ElmMdiIcon :d="mdiEmail" color="gray" />
      <ElmInlineText :text="signInEmail" />
    </div>
    <ElmTextField
      :label="label"
      v-model="signInPassword"
      is-password
      icon="lock"
    />

    <div :class="$style['button-container']">
      <ElmButton
        block
        primary
        @click="signInFunction"
        :disabled="!isValidPassword"
        :loading="signInLoading"
      >
        <ElmMdiIcon :d="mdiSend" color="gray" />
        <span>Submit</span>
      </ElmButton>
      <ElmButton block @click="back" :disabled="signInLoading">
        <ElmMdiIcon :d="mdiChevronLeftCircle" color="gray" />
        <span>Back</span>
      </ElmButton>
    </div>

    <div v-if="signInError" :class="$style.error">
      <ElmMdiIcon :d="mdiAlert" color="#c56565" />
      <ElmInlineText :text="signInError" color="#c56565" />
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
import { mdiEmail, mdiSend, mdiChevronLeftCircle, mdiAlert } from "@mdi/js";
import { onMounted, ref, watch } from "vue";

export interface ElmAuthSignInPasswordProps {
  title?: string;
  label?: string;
  signInFunction: () => Promise<void>;
}

withDefaults(defineProps<ElmAuthSignInPasswordProps>(), {
  title: "Enter your password",
  label: "Password",
});

const state = defineModel<State>("state");
const signInEmail = defineModel<string>("signInEmail", { default: "" });
const signInPassword = defineModel<string>("signInPassword", { default: "" });
const signInError = defineModel<string | null>("signInError", {
  default: null,
});
const signInLoading = defineModel<boolean>("signInLoading", { default: false });

const isValidPassword = ref(false);

watch(signInPassword, () => {
  isValidPassword.value = signInPassword.value.trim() !== "";
});

onMounted(() => {
  signInError.value = null;
  isValidPassword.value = signInPassword.value.trim() !== "";
});

const back = () => {
  state.value = "SIGN_IN";
  signInError.value = null;
};
</script>

<style module lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.flex {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}
</style>
