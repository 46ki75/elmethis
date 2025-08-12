<template>
  <div :class="$style.wrapper">
    <ElmInlineText :text="title" size="1.3rem" bold />
    <ElmInlineText :text="description" />

    <ElmTextField label="Email" v-model="signUpEmail" icon="email" />

    <ElmTextField
      label="Password"
      v-model="signUpPassword"
      icon="lock"
      is-password
    />

    <div>
      <ElmValidation
        v-for="validator in validators"
        :text="validator.label"
        :is-valid="validator.fn(signUpPassword)"
      />
    </div>

    <ElmTextField
      label="Confirm password"
      v-model="signUpPasswordRepeat"
      icon="lock"
      is-password
    />

    <div :class="$style['button-container']">
      <ElmButton
        block
        primary
        @click="signUpFunction"
        :disabled="!isValidAll"
        :loading="signUpLoading"
      >
        <ElmMdiIcon :d="mdiAccountPlus" color="gray" />
        <span>Sign up</span>
      </ElmButton>
      <ElmButton block @click="back" :disabled="signUpLoading">
        <ElmMdiIcon :d="mdiChevronLeftCircle" color="gray" />
        <span>Back</span>
      </ElmButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ElmButton,
  ElmInlineText,
  ElmMdiIcon,
  ElmTextField,
  ElmValidation,
} from "@elmethis/core";
import { State } from "../ElmCognito.vue";
import { mdiAccountPlus, mdiChevronLeftCircle } from "@mdi/js";
import { computed, onMounted, ref, watch } from "vue";

export interface ElmAuthSignUpProps {
  title?: string;
  description?: string;
  validators: Array<{
    label: string;
    fn: (password: string) => boolean;
  }>;
  signUpFunction: () => Promise<void>;
}

const props = withDefaults(defineProps<ElmAuthSignUpProps>(), {
  title: "Sign up",
  description: "Create a new account.",
});

const state = defineModel<State>("state");
const signUpEmail = defineModel<string>("signUpEmail", { default: "" });
const signUpPassword = defineModel<string>("signUpPassword", { default: "" });
const signUpPasswordRepeat = defineModel<string>("signUpPasswordRepeat", {
  default: "",
});
const signUpLoading = defineModel<boolean>("signUpLoading", {
  default: false,
});
const signUpError = defineModel<string | null>("signUpError", {
  default: "",
});

const isValidEmail = ref(false);

const validateEmail = (email: string): boolean =>
  (isValidEmail.value = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

watch(signUpEmail, (v) => {
  validateEmail(v);
});

onMounted(() => {
  isValidEmail.value = validateEmail(signUpEmail.value);
});

const back = () => {
  state.value = "SIGN_IN";
  signUpError.value = null;
};

const validatePasswordMatch = (_input: string): boolean =>
  signUpPassword.value === signUpPasswordRepeat.value;

const isValidAll = computed<boolean>(() => {
  const isValidPassword = props.validators.every(({ fn }) =>
    fn(signUpPassword.value)
  );
  return (
    validateEmail(signUpEmail.value) &&
    isValidPassword &&
    validatePasswordMatch(signUpPasswordRepeat.value)
  );
});
</script>

<style module lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
