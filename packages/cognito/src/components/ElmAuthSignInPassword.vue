<template>
  <div :class="$style.wrapper">
    <ElmInlineText :text="title" size="1.3rem" bold />
    <div :class="$style.flex">
      <ElmMdiIcon :d="mdiEmail" color="gray" />
      <ElmInlineText :text="email" />
    </div>
    <ElmTextField :label="label" v-model="password" is-password icon="lock" />

    <div :class="$style['button-container']">
      <ElmButton
        block
        primary
        @click="signInFunction"
        :disabled="!isValidPassword"
        :loading="loading"
      >
        <ElmMdiIcon :d="mdiSend" color="gray" />
        <span>Submit</span>
      </ElmButton>
      <ElmButton block @click="back" :disabled="loading">
        <ElmMdiIcon :d="mdiChevronLeftCircle" color="gray" />
        <span>Back</span>
      </ElmButton>
    </div>

    <div v-if="error" :class="$style.error">
      <ElmMdiIcon :d="mdiAlert" color="#c56565" />
      <ElmInlineText :text="error" color="#c56565" />
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
const email = defineModel<string>("email", { default: "" });
const password = defineModel<string>("password", { default: "" });
const error = defineModel<string | null>("error", { default: null });
const loading = defineModel<boolean>("loading", { default: false });

const isValidPassword = ref(false);

watch(password, () => {
  isValidPassword.value = password.value.trim() !== "";
});

onMounted(() => {
  error.value = null;
  isValidPassword.value = password.value.trim() !== "";
});

const back = () => {
  state.value = "SIGN_IN";
  error.value = null;
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
