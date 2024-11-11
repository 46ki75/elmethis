import type { Meta, StoryObj } from '@storybook/vue3'
import ElmSnackbar from './ElmSnackbar.vue'
import ElmInlineText from '../inline/ElmInlineText.vue'
import { h, ref } from 'vue'
import ElmSnackbarContainer from './ElmSnackbarContainer.vue'

const meta: Meta<typeof ElmSnackbar> = {
  title: 'Components/Containments/ElmSnackbar',
  component: ElmSnackbar,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: (args) => ({
    components: { ElmSnackbar, ElmInlineText, ElmSnackbarContainer },
    setup() {
      const isShown = ref(true)
      const handleToggle = () => {
        isShown.value = !isShown.value
      }

      const render = () => {
        return h(
          ElmSnackbar,
          { ...args, modelValue: isShown.value },
          {
            default: () => h(ElmInlineText, { text: "Hello, I'm a snackbar" })
          }
        )
      }

      return { args, isShown, handleToggle, render }
    },
    template: `
      <button @click="handleToggle">Toggle</button>
      <ElmSnackbarContainer>
        <component :is="() => render()" />
      </ElmSnackbarContainer>
    `
  })
}
