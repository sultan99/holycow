import * as R from 'ramda'
import {act, renderHook} from '@testing-library/react-hooks'
import {action, computed, createHook, createLink, createState} from '.'

const usersState = createState({
  users: [
    {id: 10, name: `John`},
    {id: 20, name: `Jane`},
  ],
  // findById: (id: number) => R.find(R.propEq('id', id), usersState.users),
})

const linkUsers = createLink(usersState)

const postsState = createState({
  cache: [
    {id: 1, title: `News`, authorId: 20},
    {id: 2, title: `Blog`, authorId: 10},
  ],
  users: linkUsers(`users`),
  posts: computed(({cache, users}) => cache.map(({authorId, id, title}) => ({
    id, title,
    author: users.find(user => user.id === authorId)
  }))),
})

const usePosts = createHook(postsState)

// avoid first creation time in tests reports
test(`Heat up renderHook`, () => {
  renderHook(() => {
    const {posts} = usePosts()
    return {posts}
  })
})

describe(`Link`, () => {
  test(`select linked value`, () => {
    const {result} = renderHook(() => {
      const {users} = usePosts()
      return {users}
    })

    expect(result.current.users).toEqual(usersState.users)
  })
  test(`select computed value from linked one`, () => {
    const {result} = renderHook(() => {
      const {posts} = usePosts()
      return {posts}
    })

    expect(result.current.posts).toEqual([
      {id: 1, title: `News`, author: {id: 20, name: `Jane`}},
      {id: 2, title: `Blog`, author: {id: 10, name: `John`}},
    ])
  })
})
