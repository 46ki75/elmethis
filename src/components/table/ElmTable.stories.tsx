import type { Meta, StoryObj } from '@storybook/vue3'
import ElmTable from './ElmTable.vue'
import ElmTableHeader from './ElmTableHeader.vue'
import ElmTableBody from './ElmTableBody.vue'
import ElmTableRow from './ElmTableRow.vue'
import ElmTableCell from './ElmTableCell.vue'

const meta: Meta<typeof ElmTable> = {
  title: 'Components/Table/ElmTable',
  component: ElmTable,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: {
      ElmTable,
      ElmTableHeader,
      ElmTableBody,
      ElmTableRow,
      ElmTableCell
    },
    template: `
      <ElmTable>
        <ElmTableHeader>
          <ElmTableRow>
            <ElmTableCell hasHeader>Header 1</ElmTableCell>
            <ElmTableCell hasHeader>Header 2</ElmTableCell>
            <ElmTableCell hasHeader>Header 3</ElmTableCell>
          </ElmTableRow>
        </ElmTableHeader>
        <ElmTableBody>
          <ElmTableRow>
            <ElmTableCell>Row 1, Cell 1</ElmTableCell>
            <ElmTableCell>Row 1, Cell 2</ElmTableCell>
            <ElmTableCell>Row 1, Cell 3</ElmTableCell>
          </ElmTableRow>
          <ElmTableRow>
            <ElmTableCell>Row 2, Cell 1</ElmTableCell>
            <ElmTableCell>Row 2, Cell 2</ElmTableCell>
            <ElmTableCell>Row 2, Cell 3</ElmTableCell>
          </ElmTableRow>
          <ElmTableRow>
            <ElmTableCell>Row 3, Cell 1</ElmTableCell>
            <ElmTableCell>Row 3, Cell 2</ElmTableCell>
            <ElmTableCell>Row 3, Cell 3</ElmTableCell>
          </ElmTableRow>
          <ElmTableRow>
            <ElmTableCell>Row 4, Cell 1</ElmTableCell>
            <ElmTableCell>Row 4, Cell 2</ElmTableCell>
            <ElmTableCell>Row 4, Cell 3</ElmTableCell>
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>
    `
  })
}
