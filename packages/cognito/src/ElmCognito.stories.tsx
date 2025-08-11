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
      const email = ref<string>("");
      const password = ref<string>("");
      const error = ref<string | null>(null);
      const loading = ref<boolean>(false);

      const signInFunction = async () => {
        loading.value = true;
        const rand = Math.random() * 2;
        await sleep(3000);

        if (rand > 1) {
          error.value = "Invalid Password";
        }

        loading.value = false;
      };

      return {
        state,
        email,
        password,
        error,
        loading,
        signInFunction,
      };
    },

    template: `
      <ElmCognito
        :signInFunction="signInFunction"
        v-model:state="state"
        v-model:email="email"
        v-model:password="password"
        v-model:error="error"
        v-model:loading="loading"
        />
    `,
  }),
};
