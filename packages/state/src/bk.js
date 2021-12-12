import * as R from 'ramda'
import {act, renderHook} from '@testing-library/react-hooks'
import {createState, computed, link} from '.'
import {LINK_TYPE} from '.'

const initialPosts = [
  {id: 1, title: `The Feynman Technique`, text: `Lorem ipsum dolor sit amet`},
  {id: 2, title: `Breaking News`, text: `Lorem ipsum dolor sit amet`},
  {id: 3, title: `How to Care Less`, text: `Lorem ipsum dolor sit amet`},
  {id: 4, title: `Learn FP`, text: `Lorem ipsum dolor sit amet`},
]

// const usePosts = createState({
//   posts: initialPosts
// })

// const linkPost = link(usePosts)
let userCallCount = 0
const initUsers = [
  {id: 1, name: `John`},
  {id: 2, name: `Jane`},
]

const useUsers = createState({
  favUserId: 1,
  selectedId: 2,
  users: initUsers,
  // posts: linkPost(`posts`),
  user: computed(state => {
    userCallCount ++
    const {selectedId, users} = state
    return users.find(user => user.id === selectedId)
  })
})

const renderHookWithCount = hook => {
  let count = 0
  const renderCount = () => count
  const result = renderHook(() => {
    count ++
    return hook()
  })
  return {renderCount, ...result}
}

describe(`State getters`, () => {
  test(`import state values outside of hook`, () => {
    const {selectedId, user, users} = useUsers(`@`)
    expect(selectedId).toBe(2)
    expect(user).toEqual({id: 2, name: `Jane`})
    expect(users).toEqual(initUsers)
    expect(userCallCount).toBe(1)
  })

  test(`import state values by selector`, () => {
    const userName = useUsers(`@user.name`)
    const users = useUsers(`@users`)
    expect(userName).toBe(`Jane`)
    expect(users).toEqual(initUsers)
    expect(userCallCount).toBe(1)
  })

  test(`import state values via hook`, () => {
    const {result} = renderHook(() => {
      const {selectedId, user, users} = useUsers()
      return {selectedId, user, users}
    })
    const {selectedId, user, users} = result.current
    expect(selectedId).toBe(2)
    expect(user).toEqual({id: 2, name: `Jane`})
    expect(users).toEqual(initUsers)
    expect(userCallCount).toBe(1)
  })

  test(`import state value via hook & selector`, () => {
    const {result} = renderHook(() => {
      const userName = useUsers(`user.name`)
      return userName
    })
    expect(result.current).toBe(`Jane`)
    expect(userCallCount).toBe(1)
  })
})

describe(`Subscriptions`, () => {
  test(`subscribe`, () => {
    userCallCount = 0
    const {result} = renderHook(() => {
      const {set, selectedId, user} = useUsers()
      return {set, selectedId, user}
    })

    let id = 0
    const updateId = value => id = value
    expect(id).toBe(0)
    expect(Object.keys(useUsers.subscribers).length).toBe(0)
    useUsers.subscribe(`selectedId`, updateId)

    const {set} = result.current
    act(() => set(`selectedId`, 2))
    expect(id).toBe(2)
    expect(result.current.selectedId).toBe(2)
    expect(useUsers.subscribers.selectedId.length).toBe(1)
    expect(userCallCount).toBe(1)

    useUsers.unsubscribe(`selectedId`, updateId)

    expect(useUsers.subscribers.selectedId.length).toBe(0)

    // after unsubscribe `let id` should not be updated
    act(() => {
      set(`favUserId`, 2)
      set(`selectedId`, 1)
    })
    expect(result.current.selectedId).toBe(1)
    expect(id).toBe(2)
    expect(userCallCount).toBe(2)
  })
})

/**
 * Computed value `user` depends on `users` & `selectedId` state values
 * on any updates of these dependant values computed value `user` should be recalculated
 * on unmount all setters should be cleaned up
*/
describe(`Component unmounted`, () => {
  test(`Clean up setters`, () => {
    const {result, unmount} = renderHook(() => {
      const {set, user} = useUsers()
      return {set, user}
    })
    const {set} = result.current

    act(() => set(`selectedId`, 1))
    expect(result.current.user).toEqual({id: 1, name: `John`})
    expect(Object.values(useUsers.subscribers).flat().length).toBe(3)

    unmount()
    expect(Object.values(useUsers.subscribers).flat().length).toBe(0)
  })
})

describe(`State links`, () => {
  test(`link`, () => {
    const linkUser = link(useUsers)
    expect(linkUser.type).toBe(LINK_TYPE)

    let id = 0
    const linkedUser = linkUser(`user`)(value => (id = value))
    expect(linkedUser).toEqual({id: 1, name: `John`})

    const {set} = useUsers(`@`)
    set(`selectedId`, 2)
    expect(id).toEqual({id: 2, name: `Jane`})

  })
  test(`Link one state to another one`, () => {
    const {result} = renderHook(() => {
      const {posts} = useUsers()
      return {posts}
    })
    const {set} = usePosts(`@`)

    expect(result.current.posts).toEqual(initialPosts)

    set(`posts`, [{
      id: 5,
      title: `Blockchain`,
      text: `Blah bla blah`,
    }])
  })
})
