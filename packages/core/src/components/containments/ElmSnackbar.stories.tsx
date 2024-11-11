import type { Meta, StoryObj } from '@storybook/vue3'
import ElmSnackbar from './ElmSnackbar.vue'
import ElmInlineText from '../inline/ElmInlineText.vue'
import { ref } from 'vue'

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
    components: { ElmSnackbar, ElmInlineText },
    setup() {
      const isShown = ref(true)
      const handleToggle = () => {
        isShown.value = !isShown.value
      }

      return { args, isShown, handleToggle }
    },
    template: `
      <button @click="handleToggle">Toggle</button>
      <ElmSnackbar v-bind="args" v-model="isShown" @update:modelValue="val => isShown = val">
        <ElmInlineText text="Hello, I'm a snackbar" />
      </ElmSnackbar>
    `
  })
}
