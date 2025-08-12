<template>
  <div :class="$style.wrapper">
    <ElmInlineText :text="title" size="1.3rem" bold />
    <ElmInlineText :text="description" />
    <ElmTextField label="Email" v-model="signUpEmail" icon="email" />
    <ElmTextField label="Password" v-model="signUpPassword" icon="lock" />

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
      <ElmButton block primary @click="next" :disabled="!isValidEmail">
        <ElmMdiIcon :d="mdiChevronRightCircle" color="gray" />
        <span>Next</span>
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
import { mdiChevronRightCircle } from "@mdi/js";
import { onMounted, ref, watch } from "vue";

export interface ElmAuthSignUpProps {
  title?: string;
  description?: string;
  validators: Array<{
    label: string;
    fn: (password: string) => boolean;
  }>;
}

withDefaults(defineProps<ElmAuthSignUpProps>(), {
  title: "Sign up",
  description: "Create a new account.",
});

const state = defineModel<State>("state");
const signUpEmail = defineModel<string>("signUpEmail", { default: "" });
const signUpPassword = defineModel<string>("signUpPassword", { default: "" });
const signUpPasswordRepeat = defineModel<string>("signUpPasswordRepeat", {
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
