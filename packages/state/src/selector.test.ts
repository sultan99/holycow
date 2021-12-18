import * as R from 'ramda'
import {renderHook} from '@testing-library/react-hooks'
import {createHook, createState, computed, action} from '.'
import {renderHookWithCount} from './utils'

let userCallCount = 0

const usersState = createState({
  likedId: 1,
  selectedId: 2,
  users: [
    {id: 1, name: `John`},
    {id: 2, name: `Jane`},
  ],
  user: computed(state => {
    userCallCount ++
    const {selectedId, users} = state
    return users.find(user => user.id === selectedId)
  }),
  setSelectedId: action(set => set(`selectedId`)),
})

const useUsers = createHook(usersState)

// avoid first creation time in tests reports
test(`Heat up renderHook`, () => {
  renderHook(() => {
    const {selectedId, user, users} = useUsers()
    return {selectedId, user, users}
  })
  expect(userCallCount).toBe(1)
})

describe(`State getter`, () => {
  test(`select values`, () => {
    const {result, renderCount} = renderHookWithCount(() => {
      const {likedId, selectedId} = useUsers()
      return {likedId, selectedId}
    })

    expect(result.current.likedId).toBe(1)
    expect(result.current.selectedId).toBe(2)
    expect(userCallCount).toBe(1)
    expect(renderCount()).toBe(1)
  })

  test(`select computed value`, () => {
    const {result} = renderHook(() => {
      const {user} = useUsers()
      return {user}
    })

    expect(userCallCount).toBe(1)
    expect(result.current.user).toEqual({id: 2, name: `Jane`})
  })

  test(`computed value with hook wrapper`, () => {
    /**
      const userName = computed(({userId}, select) => {
        const users = select(`users`, useUsers)
        const user = users.find(user => user.id === userId)
        return user.name
      })
    */
    expect(1).toBe(1) // TODO
  })

  test(`single path selector`, () => {
    const {result} = renderHook(() => useUsers(`user.id`))

    expect(result.current).toBe(2)
  })

  test(`multiple path selectors`, () => {
    const {result} = renderHook(() => useUsers(`likedId`, `user.name`, `users.0.id`))
    const [likedId, userName, userId] = result.current

    expect(likedId).toBe(1)
    expect(userName).toBe(`Jane`)
    expect(userId).toBe(1)
  })
})
