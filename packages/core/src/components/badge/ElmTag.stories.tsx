import type { Meta, StoryObj } from '@storybook/vue3'
import ElmTag from './ElmTag.vue'
import { lighten } from 'polished'

const meta: Meta<typeof ElmTag> = {
  title: 'Components/badge/ElmTag',
  component: ElmTag,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    text: 'Primary',
    color: lighten(0.3, '#6987b8')
  }
}

export const Multiple: Story = {
  render: () => ({
    components: { ElmTag },
    template: `
      <div style="display: flex; gap: 0.25rem;">
        <ElmTag text="Primary Tag" color="${lighten(0.2, '#6987b8')}" />
        <ElmTag text="Secondary Tag" color="${lighten(0.2, '#bf7e71')}" />
        <ElmTag text="Success Tag" color="${lighten(0.2, '#59b57c')}" />
        <ElmTag text="Danger Tag" color="${lighten(0.2, '#b36472')}" />
        <ElmTag text="Warning Tag" color="${lighten(0.2, '#b8a36e')}" />
        <ElmTag text="Info Tag" color="${lighten(0.2, '#9771bd')}" />
      </div>
    `
  })
}
