import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmCognito, { type State } from "./ElmCognito.vue";
import { ref } from "vue";

const meta: Meta<typeof ElmCognito> = {
  title: "Cognito/ElmCognito",
  component: ElmCognito,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

const sleep = async (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));

export const Primary: Story = {
  render: () => ({
    components: { ElmCognito },

    setup(_args) {
      const state = ref<State>("SIGN_IN");
      const signInEmail = ref<string>("");
      const signInPassword = ref<string>("");
      const signInError = ref<string | null>(null);
      const signInLoading = ref<boolean>(false);

      const signInFunction = async () => {
        signInLoading.value = true;
        const rand = Math.random() * 2;
        await sleep(1500);

        if (rand > 1) {
          signInError.value = "Invalid Password";
        }

        signInLoading.value = false;
      };

      return {
        state,
        signInEmail,
        signInPassword,
        signInError,
        signInLoading,
        signInFunction,
      };
    },

    template: `
      <ElmCognito
        :signInFunction="signInFunction"
        v-model:state="state"
        v-model:signInEmail="signInEmail"
        v-model:signInPassword="signInPassword"
        v-model:signInError="signInError"
        v-model:signInLoading="signInLoading"
        />
    `,
  }),
};
