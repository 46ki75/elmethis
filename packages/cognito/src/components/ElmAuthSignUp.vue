<template>
  <div :class="$style.wrapper">
    <ElmInlineText :text="title" size="1.3rem" bold />
    <ElmInlineText :text="description" />
    <ElmTextField
      label="Email"
      v-model="signUpEmail"
      icon="email"
      is-password
    />
    <ElmTextField
      label="Password"
      v-model="signUpPassword"
      icon="lock"
      is-password
    />

    <div>
      <ElmValidation
        v-for="validator in validators"
        :validate-function="validator.fn"
        :text="validator.label"
        :input="signUpPassword"
      />
    </div>

    <ElmTextField
      label="Confirm password"
      v-model="signUpPasswordRepeat"
      icon="lock"
    />

    <div :class="$style['button-container']">
      <ElmButton block primary @click="next" :disabled="!isValidAll">
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
import { onMounted, ref, watch } from "vue";

export interface ElmAuthSignUpProps {
  title?: string;
  description?: string;
  validators: Array<{
    label: string;
    fn: (password: string) => boolean;
  }>;
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

const next = () => {
  state.value = "SIGN_IN_PASSWORD";
};

const back = () => {
  state.value = "SIGN_IN";
  signUpError.value = null;
};

const validatePasswordMatch = (_input: string): boolean =>
  signUpPassword.value === signUpPasswordRepeat.value;

const isValidAll = ref(false);

watch(
  [signUpEmail, signUpPassword, signUpPasswordRepeat],
  ([signUpEmail, signUpPassword, signUpPasswordRepeat]) => {
    const isValidPassword = props.validators.every(({ fn }) =>
      fn(signUpPassword)
    );
    isValidAll.value =
      validateEmail(signUpEmail) &&
      isValidPassword &&
      validatePasswordMatch(signUpPasswordRepeat);
  }
);
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
