import type { Meta, StoryObj } from '@storybook/vue3'
import ElmSnackbar from './ElmSnackbar.vue'
import ElmInlineText from '../inline/ElmInlineText.vue'

const meta: Meta<typeof ElmSnackbar> = {
  title: 'Components/Containments/ElmSnackbar',
  component: ElmSnackbar,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const SnackbarOnly: Story = {
  args: {
    timeout: 5000,
    remain: 2500
  },
  render: (args) => ({
    components: { ElmSnackbar, ElmInlineText },
    setup() {
      return { args }
    },
    template: `
      <ElmSnackbar v-bind="args">
        <ElmInlineText text="Snackbar Content" />
      </ElmSnackbar>
    `
  })
}

// export const Primary: Story = {
//   render: (args) => ({
//     components: { ElmSnackbar, ElmInlineText, ElmSnackbarContainer },
//     setup() {
//       const isShown = ref(true)
//       const handleToggle = () => {
//         isShown.value = !isShown.value
//       }

//       return { args, isShown, handleToggle }
//     },
//     template: `
//       <button @click="handleToggle">Toggle</button>
//       <ElmSnackbarContainer>
//         <ElmSnackbar v-if="isShown" v-bind="args" v-model="isShown">
//           <ElmInlineText text="Snackbar Content" />
//         </ElmSnackbar>
//         <ElmSnackbar >
//           <ElmInlineText text="Snackbar Content" />
//         </ElmSnackbar>
//       </ElmSnackbarContainer>
//     `
//   })
// }
