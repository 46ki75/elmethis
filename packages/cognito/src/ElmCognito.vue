<template>
  <div :class="$style.wrapper">
    <Transition
      mode="out-in"
      :leave-from-class="$style['t-enter-active']"
      :enter-to-class="$style['t-enter-to']"
      :enter-active-class="$style['t-enter-active']"
      :leave-active-class="$style['t-leave-active']"
      :enter-from-class="$style['t-enter-from']"
      :leave-to-class="$style['t-leave-to']"
    >
      <ElmAuthSignIn
        v-if="state === 'SIGN_IN'"
        v-model:state="state"
        v-model:signInEmail="signInEmail"
      />
      <ElmAuthSignInPassword
        v-else-if="state === 'SIGN_IN_PASSWORD'"
        :signInFunction="signInFunction"
        v-model:state="state"
        v-model:signInEmail="signInEmail"
        v-model:signInPassword="signInPassword"
        v-model:signInError="signInError"
        v-model:signInLoading="signInLoading"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import ElmAuthSignIn from "./components/ElmAuthSignIn.vue";
import ElmAuthSignInPassword from "./components/ElmAuthSignInPassword.vue";

export interface ElmCognitoProps {
  signInFunction: () => Promise<void>;
}

withDefaults(defineProps<ElmCognitoProps>(), {});

export type State = "SIGN_IN" | "SIGN_UP" | "SIGN_IN_PASSWORD";

const state = defineModel<State>({ default: "SIGN_IN" });
const signInEmail = defineModel<string>("signInEmail", { default: "" });
const signInPassword = defineModel<string>("signInPassword", { default: "" });
const signInError = defineModel<string | null>("signInError", {
  default: null,
});
const signInLoading = defineModel<boolean>("signInLoading", { default: false });
</script>

<style module lang="scss">
.t-enter-to,
.t-leave-from {
  opacity: 1;
  transform: translateX(0rem);
}

.t-enter-active,
.t-leave-active {
  transition:
    opacity 200ms,
    transform 200ms;
}

.t-enter-from,
.t-leave-to {
  opacity: 0;
  transform: translateX(-0.5rem);
}

.wrapper {
  max-width: 500px;
}
</style>
