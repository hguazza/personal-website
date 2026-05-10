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

export interface Paper {
  title: string
  description: string
  solved: string
  url?: string
  authors?: string
  year?: number
}

export interface Repo {
  title: string
  description: string
  solved: string
  url: string
  tags?: string[]
}

export interface Video {
  title: string
  description: string
  solved: string
  url: string
  channel: string
}

export interface Article {
  title: string
  description: string
  solved: string
  url?: string
  source?: string
}
