import { Client } from '../src/index.js'

if (process.env.NOTION_API_KEY === undefined) {
  throw new Error('NOTION_API_KEY is required')
}

const client = new Client({ auth: process.env.NOTION_API_KEY })
