import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { Post } from '@/types'

function getNotion() {
  return new Client({ auth: process.env.NOTION_API_KEY })
}

function getN2m() {
  return new NotionToMarkdown({ notionClient: getNotion() })
}

export async function getPosts(): Promise<Post[]> {
  const notion = getNotion()
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: { property: 'Published', checkbox: { equals: true } },
    sorts: [{ property: 'Date', direction: 'descending' }],
  })
  return response.results.map(pageToPost)
}

export async function getPost(
  slug: string
): Promise<{ post: Post; markdown: string } | null> {
  const notion = getNotion()
  const n2m = getN2m()
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      and: [
        { property: 'Slug', rich_text: { equals: slug } },
        { property: 'Published', checkbox: { equals: true } },
      ],
    },
  })
  if (!response.results[0]) return null
  const page = response.results[0]
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
    cover:
      page.cover?.external?.url ?? page.cover?.file?.url ?? null,
  }
}
