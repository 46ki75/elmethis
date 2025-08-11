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
const email = defineModel<string>("email", { default: "" });

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
</style>
