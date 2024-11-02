import type { Meta, StoryObj } from '@storybook/vue3'
import ElmParallax from './ElmParallax.vue'

const meta: Meta<typeof ElmParallax> = {
  title: 'Components/Containments/ElmParallax',
  component: ElmParallax,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { ElmParallax },
    template: `<div :style="{height: '1000vh'}"><ElmParallax imageUrl1="/bg1.webp" imageUrl2="/bg2.webp" /></div>`
  })
}
