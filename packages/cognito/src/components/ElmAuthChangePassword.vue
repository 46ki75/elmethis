<template>
  <div :class="$style.wrapper">
    <ElmInlineText :text="title" size="1.3rem" bold />
    <ElmInlineText :text="description" />

    <ElmTextField
      label="Password"
      v-model="changePasswordPassword"
      icon="lock"
      is-password
    />

    <div>
      <ElmValidation
        v-for="validator in validators"
        :text="validator.label"
        :is-valid="validator.fn(changePasswordPassword)"
      />
    </div>

    <ElmTextField
      label="Confirm password"
      v-model="changePasswordPasswordRepeat"
      icon="lock"
      is-password
    />

    <div :class="$style['button-container']">
      <ElmButton
        block
        primary
        @click="changePasswordFunction"
        :disabled="!isValidAll"
        :loading="changePasswordLoading"
      >
        <ElmMdiIcon :d="mdiRefresh" color="gray" />
        <span>Change password</span>
      </ElmButton>
      <ElmButton block @click="back" :disabled="changePasswordLoading">
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
import { type State } from "../ElmCognito.vue";
import { computed } from "vue";
import { mdiChevronLeftCircle, mdiRefresh } from "@mdi/js";

export interface ElmAuthChangePasswordProps {
  title?: string;
  description?: string;
  validators: Array<{
    label: string;
    fn: (password: string) => boolean;
  }>;
  changePasswordFunction: () => Promise<void>;
}

const props = withDefaults(defineProps<ElmAuthChangePasswordProps>(), {
  title: "Change password",
  description: "Please choose a unique password to secure your account.",
});

const state = defineModel<State>("state");
const changePasswordPassword = defineModel<string>("changePasswordPassword", {
  default: "",
});
const changePasswordPasswordRepeat = defineModel<string>(
  "changePasswordPasswordRepeat",
  { default: "" }
);
const changePasswordLoading = defineModel<boolean>("changePasswordLoading", {
  default: false,
});
const changePasswordError = defineModel<string | null>("changePasswordError", {
  default: "",
});

const isValidAll = computed<boolean>(() => {
  const isValidPassword = props.validators.every(({ fn }) =>
    fn(changePasswordPassword.value)
  );
  return (
    isValidPassword &&
    changePasswordPassword.value === changePasswordPasswordRepeat.value
  );
});

const back = () => {
  state.value = "SIGN_IN";
  changePasswordError.value = null;
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
