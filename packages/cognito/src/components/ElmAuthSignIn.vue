<template>
  <div :class="$style.wrapper">
    <ElmInlineText :text="title" size="1.3rem" bold />
    <ElmInlineText :text="description" />
    <ElmTextField :label="label" v-model="email" icon="email" />

    <div :class="$style['button-container']">
      <ElmButton block primary @click="next" :disabled="!isValidEmail">
        <ElmMdiIcon :d="mdiChevronRightCircle" color="gray" />
        <span>Next</span>
      </ElmButton>
    </div>

    <div :class="$style['link-container']">
      <ElmInlineText text="New user ? " />
      <ElmInlineText
        :class="$style.link"
        text="Create an account"
        @click="state = 'SIGN_UP'"
        color="#bfa056"
      />
    </div>
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
import { onMounted, ref, watch } from "vue";

export interface ElmAuthSignInEmailProps {
  title?: string;
  description?: string;
  label?: string;
}

withDefaults(defineProps<ElmAuthSignInEmailProps>(), {
  title: "Sign in",
  description: "Sign in to your account.",
  label: "email",
});

const state = defineModel<State>("state");
const email = defineModel<string>("signInEmail", { default: "" });

const isValidEmail = ref(false);

const validate = (email: string): boolean =>
  (isValidEmail.value = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

watch(email, (v) => {
  validate(v);
});

onMounted(() => {
  isValidEmail.value = validate(email.value);
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

.link-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.link {
  cursor: pointer;
  opacity: 1;
  transition: opacity 200ms;

  &:hover {
    opacity: 0.5;
  }
}
</style>
