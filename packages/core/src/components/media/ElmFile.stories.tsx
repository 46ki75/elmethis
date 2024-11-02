import type { Meta, StoryObj } from '@storybook/vue3'
import ElmFile from './ElmFile.vue'

const meta: Meta<typeof ElmFile> = {
  title: 'Components/Media/ElmFile',
  component: ElmFile,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    src: '/vue.svg',
    bytes: 496
  }
}
