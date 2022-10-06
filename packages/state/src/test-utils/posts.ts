import {createState} from '..'

export type Post = {
  id: number
  title: string
  text?: string
  link?: string
}

export type PostState = {
  currentPostId?: number
  posts: Post[]
}

export const postState = {
  currentPostId: 1,
  posts: [
    {id: 1, title: `React Hooks`},
    {id: 2, title: `Goodbye Node JS`},
    {id: 3, title: `TDD Changed My Life`},
    {id: 4, title: `Stop Using JSON Web Tokens`},
  ]
}

export const usePosts = createState<PostState>(postState)
