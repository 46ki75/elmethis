import type { Meta, StoryObj } from '@storybook/vue3'
import ElmBulletedList from './ElmBulletedList.vue'
import ElmInlineText from './ElmInlineText.vue'

const meta: Meta<typeof ElmBulletedList> = {
  title: 'Components/Typography/ElmBulletedList',
  component: ElmBulletedList,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { ElmBulletedList, ElmInlineText },
    template: `<ElmBulletedList>
      <li><ElmInlineText text='Item 1'/></li>
      <li><ElmInlineText text='Item 2'/></li>
      <li><ElmInlineText text='Item 3'/></li>
    </ElmBulletedList>`
  })
}

export const Nested: Story = {
  render: () => ({
    components: { ElmBulletedList, ElmInlineText },
    template: `<ElmBulletedList>
      <li><ElmInlineText text='Item 1'/></li>
      <li><ElmInlineText text='Item 2'/>
        <ElmBulletedList>
          <li><ElmInlineText text='Item 2.1'/></li>
          <li><ElmInlineText text='Item 2.2'/>
            <ElmBulletedList>
              <li><ElmInlineText text='Item 2.2.1'/></li>
              <li><ElmInlineText text='Item 2.2.2'/></li>
              <li><ElmInlineText text='Item 2.2.3'/></li>
            </ElmBulletedList>
          </li>
          <li><ElmInlineText text='Item 2.3'/></li>
        </ElmBulletedList>
      </li>
      <li><ElmInlineText text='Item 3'/></li>
    </ElmBulletedList>`
  })
}
