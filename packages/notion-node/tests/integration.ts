import { Client as NotionClient } from '@notionhq/client'
import { Client } from '../src/index.js'
import 'dotenv/config'

const NOTION_API_KEY = process.env.NOTION_API_KEY

if (NOTION_API_KEY === undefined) {
  throw new Error('NOTION_API_KEY is required')
}

const NOTION_PAGE_ID = process.env.NOTION_PAGE_ID

if (NOTION_PAGE_ID === undefined) {
  throw new Error('NOTION_PAGE_ID is required')
}

const notion = new NotionClient({ auth: process.env.NOTION_API_KEY })

const client = new Client({ auth: process.env.NOTION_API_KEY })

const results = await client.convert(NOTION_PAGE_ID)

console.log(JSON.stringify(results))
