export interface Post {
  id: string
  title: string
  slug: string
  date: string
  tags: string[]
  cover: string | null
}

export interface Project {
  title: string
  description: string
  stack: string[]
  highlight?: string
}
