import { Client } from '@notionhq/client'
import 'dotenv/config'

export default eventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'application/json')
  const { id } = getRouterParams(event)

  const client = new Client({ auth: process.env.NOTION_API_KEY })

  const data = await client.blocks.children.list({
    block_id: String(id),
    page_size: 100
  })

  return data.results
})
