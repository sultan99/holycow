import {act} from 'react-dom/test-utils'
import {renderHook} from '../test-utils'
import {usePosts} from '../test-utils/posts'

afterEach(() => {
  usePosts.reset()
})

describe(`🎬 Action`, () => {
  const newPost = {id: 5, title: `Hello World`}

  it(`should set a value via action`, () => {
    act(() => usePosts.addPost(newPost))
    expect(usePosts.posts[4]).toEqual(newPost)
    expect(usePosts.posts.length).toBe(5)
  })

  it(`should set a value via action using hook`, () => {
    const {result} = renderHook(usePosts)
    act(() => result.addPost(newPost))
    expect(result.posts[4]).toEqual(newPost)
    expect(result.posts.length).toBe(5)
  })
})
