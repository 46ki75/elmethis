# elmethis/notion-node

## Basic Usage

```ts
const client = new Client({ auth: process.env.NOTION_API_KEY })

await client.convert({
  id: NOTION_PAGE_ID
})

console.log(JSON.stringify(client.components))
```

### Save locally

```ts
const client = new Client({ auth: process.env.NOTION_API_KEY })

await client.convert({
  id: NOTION_PAGE_ID
})

await client.save('./public')

console.log(JSON.stringify(client.components))
```
