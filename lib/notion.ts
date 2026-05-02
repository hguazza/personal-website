import { Client, isFullPage } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { Post } from '@/types'

function makeClients() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY })
  const n2m = new NotionToMarkdown({ notionClient: notion })
  return { notion, n2m }
}

export async function getPosts(): Promise<Post[]> {
  const { notion } = makeClients()
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: { property: 'Published', checkbox: { equals: true } },
    sorts: [{ property: 'Date', direction: 'descending' }],
  })
  return response.results.filter(isFullPage).map(pageToPost)
}

export async function getPost(
  slug: string
): Promise<{ post: Post; markdown: string } | null> {
  const { notion, n2m } = makeClients()
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      and: [
        { property: 'Slug', rich_text: { equals: slug } },
        { property: 'Published', checkbox: { equals: true } },
      ],
    },
  })
  const page = response.results.filter(isFullPage)[0]
  if (!page) return null
  const mdBlocks = await n2m.pageToMarkdown(page.id)
  const { parent: markdown } = n2m.toMarkdownString(mdBlocks)
  return { post: pageToPost(page), markdown }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pageToPost(page: any): Post {
  const props = page.properties
  return {
    id: page.id,
    title: props.Title?.title[0]?.plain_text ?? '',
    slug: props.Slug?.rich_text[0]?.plain_text ?? '',
    date: props.Date?.date?.start ?? '',
    tags: props.Tags?.multi_select?.map((t: { name: string }) => t.name) ?? [],
    cover: page.cover?.external?.url ?? page.cover?.file?.url ?? null,
  }
}
