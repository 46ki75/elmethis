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
    src: '/vite.svg',
    filesize: '1.46 KB'
  }
}
