import {act} from 'react-dom/test-utils'
import {createState} from '..'
import {postState, usePosts} from '../test-utils/posts'
import {renderHook} from '../test-utils'

afterEach(() => {
  usePosts.reset()
})

it(`Heating up tests`, () => {
  const {result} = renderHook(usePosts)
  expect(result.currentPostId).toBe(1)
})

describe(`🐣 Reset state`, () => {
  it(`should reset state to initial value`, () => {
    usePosts.set(`posts`, [])
    expect(usePosts.posts).toEqual([])
    expect(postState.posts).not.toEqual([]) // no mutation

    usePosts.reset()
    expect(usePosts.posts).toEqual(postState.posts)
  })

  it(`should reset state with overriding value`, () => {
    usePosts.set(`posts`, [])
    expect(usePosts.posts).toEqual([])
    expect(usePosts.currentPostId).toBe(1)

    usePosts.reset({currentPostId: 2})
    expect(usePosts.currentPostId).toBe(2)
    expect(usePosts.posts).toEqual(postState.posts)
  })
})

describe(`🐣 Reset state via hook`, () => {
  it(`should reset state to initial value`, () => {
    const {result} = renderHook(usePosts)

    act(() => result.set(`posts`, []))
    expect(result.posts).toEqual([])
    expect(result.posts).toBe(usePosts.posts)
    expect(postState.posts).not.toEqual([]) // no mutation

    act(() => result.reset())
    expect(result.posts).toBe(usePosts.posts)
    expect(result.posts).toEqual(postState.posts)
  })

  it(`should reset state with overriding value`, () => {
    const {result} = renderHook(usePosts)

    act(() => result.set(`posts`, []))
    expect(result.posts).toEqual([])
    expect(result.currentPostId).toBe(1)

    act(() => result.reset({currentPostId: 2}))
    expect(result.currentPostId).toBe(2)
    expect(result.posts).toEqual(postState.posts)
  })
})

describe(`🍟 State setter`, () => {
  it(`should set a value by key`, () => {
    usePosts.set(`posts`, [])
    expect(usePosts.posts).toEqual([])
  })

  it(`should set a value by key via function`, () => {
    const newPost = {id: 5, title: `New Post`}

    usePosts.set(`posts`, posts => [...posts, newPost])
    expect(usePosts.posts).toEqual([...postState.posts, newPost])
  })

  it(`should set a value by path`, () => {
    usePosts.set(`posts.0.title`, `New Title`)
    expect(usePosts.posts[0].title).toBe(`New Title`)
    expect(usePosts.posts).not.toEqual(postState.posts) // no mutation
  })

  it(`should set a value by path via function`, () => {
    usePosts.set(`posts.0.title`, value => `${value}!`)
    expect(usePosts.posts[0].title).toBe(`React Hooks!`)
  })

  it(`should set values via object`, () => {
    usePosts.set({currentPostId: 3, posts: () => []})
    expect(usePosts.currentPostId).toBe(3)
    expect(usePosts.posts).toEqual([])
  })

  it(`should set whole state via function`, () => {
    usePosts.set(state => ({...state, currentPostId: 3}))
    expect(usePosts.currentPostId).toBe(3)
  })
})

describe(`🍟 State curried setter`, () => {
  it(`should set a value by key`, () => {
    const setPosts = usePosts.set(`posts`)

    setPosts([])
    expect(usePosts.posts).toEqual([])
  })

  it(`should set a value by key via function`, () => {
    const newPost = {id: 5, title: `New Post`}
    const appendPosts = usePosts.set(`posts`)

    appendPosts(posts => [...posts, newPost])
    expect(usePosts.posts).toEqual([...postState.posts, newPost])
  })

  it(`should set a value by path`, () => {
    const setTitle = usePosts.set(`posts.0.title`)

    setTitle(`New Title`)
    expect(usePosts.posts[0].title).toBe(`New Title`)
  })

  it(`should set a value by path via function`, () => {
    const setTitle = usePosts.set(`posts.0.title`)

    setTitle(value => `${value}!`)
    expect(usePosts.posts[0].title).toBe(`React Hooks!`)
  })
})

describe(`🍟 State setter using hook`, () => {
  it(`should set a value by key`, () => {
    const {result} = renderHook(usePosts)

    act(() => result.set(`posts`, []))
    expect(result.posts).toEqual([])
  })

  it(`should set a value by key via function`, () => {
    const {result} = renderHook(usePosts)
    const newPost = {id: 5, title: `New Post`}

    act(() => result.set(`posts`, posts => [...posts, newPost]))
    expect(result.posts).toEqual([...postState.posts, newPost])
  })

  it(`should set a value by path`, () => {
    const {result} = renderHook(usePosts)

    act(() => result.set(`posts.0.title`, `New Title`))
    expect(result.posts[0].title).toBe(`New Title`)
    expect(result.posts).not.toEqual(postState.posts) // no mutation
  })

  it(`should set a value by path via function`, () => {
    const {result} = renderHook(usePosts)

    act(() => result.set(`posts.0.title`, value => `${value}!`))
    expect(result.posts[0].title).toBe(`React Hooks!`)
  })

  it(`should set values via object`, () => {
    const {result} = renderHook(usePosts)

    act(() => result.set({currentPostId: 3, posts: () => []}))
    expect(result.currentPostId).toBe(3)
    expect(result.posts).toEqual([])
  })

  it(`should set whole state via function`, () => {
    const {result} = renderHook(usePosts)

    act(() => result.set(state => ({...state, currentPostId: 3})))
    expect(result.currentPostId).toBe(3)
  })
})

describe(`🍟 State curried setter using hook`, () => {
  it(`should set a value by key`, () => {
    const {result} = renderHook(usePosts)
    const setPosts = result.set(`posts`)

    act(() => setPosts([]))
    expect(result.posts).toEqual([])
  })

  it(`should set a value by key via function`, () => {
    const {result} = renderHook(usePosts)
    const newPost = {id: 5, title: `New Post`}
    const setPosts = result.set(`posts`)

    act(() => setPosts(posts => [...posts, newPost]))
    expect(result.posts).toEqual([...postState.posts, newPost])
  })

  it(`should set a value by path`, () => {
    const {result} = renderHook(usePosts)
    const setTitle = result.set(`posts.0.title`)

    act(() => setTitle(`New Title`))
    expect(result.posts[0].title).toBe(`New Title`)
  })

  it(`should set a value by path via function`, () => {
    const {result} = renderHook(usePosts)
    const setTitle = result.set(`posts.0.title`)

    act(() => setTitle(value => `${value}!`))
    expect(result.posts[0].title).toBe(`React Hooks!`)
  })
})

describe(`📬 State subscription`, () => {
  it(`should subscribe to state changes`, () => {
    let count = 0
    const postStore = createState(postState)

    postStore.subscribe(state => {
      count ++
      expect(state.currentPostId).toBe(4)
    })

    postStore.set(`currentPostId`, 4)
    expect(count).toBe(1)
  })

  it(`should subscribe to specific field of state changes`, () => {
    let countCurrentPostId = 0
    const postStore = createState(postState)

    postStore.subscribe(`currentPostId`, currentPostId => {
      countCurrentPostId ++
      expect(currentPostId).toBe(4)
    })

    postStore.set(`currentPostId`, 4)
    expect(countCurrentPostId).toBe(1)
  })

  it(`should verify subscription changes do not affect each other`, () => {
    let countPosts = 0
    let countPostsTitle = 0
    const postStore = createState(postState)

    postStore.subscribe(`posts`, posts => {
      countPosts ++
      expect(posts.length).toBe(4)
      expect(posts[0].title).toBe(`Renamed`)
    })

    postStore.subscribe(`posts.1.title`, title => {
      countPostsTitle ++
      expect(title).toBe(`Hacked post`)
    })

    postStore.set(`posts.0.title`, `Renamed`)
    postStore.set(`posts.1.title`, `Hacked post`)

    expect(countPosts).toBe(2)
    expect(countPostsTitle).toBe(1)
  })

  it(`should unsubscribe listener`, () => {
    let countPostsTitle = 0
    const postStore = createState(postState)

    const unsubscribe = postStore.subscribe(`currentPostId`, () => {
      countPostsTitle ++
    })

    unsubscribe()
    postStore.set(`currentPostId`, 5)
    expect(countPostsTitle).toBe(0)
  })
})
