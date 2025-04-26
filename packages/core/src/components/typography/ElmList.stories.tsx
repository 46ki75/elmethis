import type { Meta, StoryObj } from '@storybook/vue3'
import ElmList from './ElmList.vue'
import ElmInlineText from './ElmInlineText.vue'

const meta: Meta<typeof ElmList> = {
  title: 'Components/Typography/ElmList',
  component: ElmList,
  tags: ['autodocs'],
  args: {},
  argTypes: {
    listStyle: {
      options: ['unordered', 'ordered'],
      control: 'radio'
    }
  },
  render: (args) => ({
    setup() {
      return { args }
    },
    components: { ElmList, ElmInlineText },
    template: `<ElmList v-bind="args">
      <li><ElmInlineText text='Item 1'/></li>
      <li><ElmInlineText text='Item 2'/></li>
      <li><ElmInlineText text='Item 3'/></li>
    </ElmList>`
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Unordered: Story = {
  args: { listStyle: 'unordered' }
}

export const Ordered: Story = {
  args: { listStyle: 'ordered' }
}

export const Nested: Story = {
  args: { listStyle: 'unordered' },
  render: (args) => ({
    setup() {
      return { args }
    },
    components: { ElmList, ElmInlineText },
    template: `<ElmList v-bind="args">
      <li><ElmInlineText text='Item 1'/></li>
      <li><ElmInlineText text='Item 2'/>
        <ElmList v-bind="args">
          <li><ElmInlineText text='Item 2.1'/></li>
          <li><ElmInlineText text='Item 2.2'/>
            <ElmList v-bind="args">
              <li><ElmInlineText text='Item 2.2.1'/></li>
              <li><ElmInlineText text='Item 2.2.2'/></li>
              <li><ElmInlineText text='Item 2.2.3'/></li>
            </ElmList>
          </li>
          <li><ElmInlineText text='Item 2.3'/></li>
        </ElmList>
      </li>
      <li><ElmInlineText text='Item 3'/></li>
    </ElmList>`
  })
}
