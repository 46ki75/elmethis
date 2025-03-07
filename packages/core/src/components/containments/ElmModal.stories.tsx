import type { Meta, StoryObj } from '@storybook/vue3'
import ElmModal from './ElmModal.vue'
import { ref } from 'vue'
import ElmInlineText from '../inline/ElmInlineText.vue'

const meta: Meta<typeof ElmModal> = {
  title: 'Components/Containments/ElmModal',
  component: ElmModal,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { ElmModal, ElmInlineText },
    setup() {
      const isOpen = ref(true)
      return { isOpen }
    },
    template: `
      <div>
        <button @click="isOpen = !isOpen">Toggle Modal</button>
        <ElmModal v-model:isOpen="isOpen">
          <ElmInlineText text="Hello world!" />
        </ElmModal>
      </div>
    `
  })
}
