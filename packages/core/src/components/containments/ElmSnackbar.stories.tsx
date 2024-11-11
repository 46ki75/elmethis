import type { Meta, StoryObj } from '@storybook/vue3'
import ElmSnackbarContainer from './ElmSnackbarContainer.vue'
import { ref } from 'vue'
import { nanoid } from 'nanoid'
import { useTimeoutFn } from '@vueuse/core'

const meta: Meta<typeof ElmSnackbarContainer> = {
  title: 'Components/Containments/ElmSnackbar',
  component: ElmSnackbarContainer,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const SnackbarOnly: Story = {
  args: {
    snackbars: []
  },
  render: (args) => ({
    components: { ElmSnackbarContainer },
    setup() {
      const snackbars = ref(args.snackbars)

      const remove = (id: string) => {
        snackbars.value = snackbars.value.filter(
          (snackbar) => snackbar.id !== id
        )
      }

      const push = () => {
        const id = nanoid()
        snackbars.value.push({
          id,
          label: 'Snackbar Content',
          timeout: 5000,
          close: () => remove(id)
        })

        useTimeoutFn(() => {
          remove(id)
        }, 5000)
      }

      return { args, snackbars, push, remove }
    },
    template: `
    <button @click="push">PUSH</button>
    <ElmSnackbarContainer v-bind="args" :snackbars="snackbars" />`
  })
}
