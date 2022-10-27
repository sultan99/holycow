import type {Action, Computed} from '..'
import {action, computed, createState} from '..'
import {renderHook} from '../test-utils'

export type Post = {
  id: number
  title: string
  text?: string
  link?: string
}

export type PostState = {
  currentPostId?: number
  posts: Post[]
  post: Computed<PostState, Post | undefined>
  addPost: Action<PostState, [Post]>
}

export const postState: PostState = {
  currentPostId: 1,
  posts: [
    {id: 1, title: `React Hooks`},
    {id: 2, title: `Goodbye Node JS`},
    {id: 3, title: `TDD Changed My Life`},
    {id: 4, title: `Stop Using JSON Web Tokens`},
  ],
  post: computed(({currentPostId, posts}) =>
    posts.find(post => post.id === currentPostId)
  ),
  addPost: action(({set}) => post =>
    set(`posts`, posts => [...posts, post])
  ),
}

export const usePosts = createState(postState)

it(`🔥 Heating up tests`, () => {
  const {result} = renderHook(usePosts)
  expect(result.currentPostId).toBe(1)
})
