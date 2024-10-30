import type { Meta, StoryObj } from '@storybook/vue3'
import ElmNumberedList from './ElmNumberedList.vue'
import ElmInlineText from '../inline/ElmInlineText.vue'

const meta: Meta<typeof ElmNumberedList> = {
  title: 'Components/Typography/ElmNumberedList',
  component: ElmNumberedList,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { ElmNumberedList, ElmInlineText },
    template: `<ElmNumberedList>
      <li><ElmInlineText text='Item 1'/></li>
      <li><ElmInlineText text='Item 2'/></li>
      <li><ElmInlineText text='Item 3'/></li>
    </ElmNumberedList>`
  })
}

export const Nested: Story = {
  render: () => ({
    components: { ElmNumberedList, ElmInlineText },
    template: `<ElmNumberedList>
      <li><ElmInlineText text='Item 1'/></li>
      <li><ElmInlineText text='Item 2'/>
        <ElmNumberedList>
          <li><ElmInlineText text='Item 2.1'/></li>
          <li><ElmInlineText text='Item 2.2'/>
            <ElmNumberedList>
              <li><ElmInlineText text='Item 2.2.1'/></li>
              <li><ElmInlineText text='Item 2.2.2'/></li>
              <li><ElmInlineText text='Item 2.2.3'/></li>
            </ElmNumberedList>
          </li>
          <li><ElmInlineText text='Item 2.3'/></li>
        </ElmNumberedList>
      </li>
      <li><ElmInlineText text='Item 3'/></li>
    </ElmNumberedList>`
  })
}
