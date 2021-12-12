import * as R from 'ramda'
import {createState, computed, action} from '.'

let userCallCount = 0

const useUsers = createState({
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

describe(`Static state`, () => {
  test(`spread select values`, () => {
    const {likedId, selectedId, setSelectedId, user, users} = useUsers
    expect(1).toBe(userCallCount)
    expect(likedId).toBe(1)
    expect(selectedId).toBe(2)
    expect(user).toEqual({id: 2, name: `Jane`})
    expect(setSelectedId).toBeInstanceOf(Function)
    expect(users).toEqual([
      {id: 1, name: `John`},
      {id: 2, name: `Jane`},
    ])
    expect(1).toBe(userCallCount) // value is taken from state cache, function user is not called
  })

  test(`direct select`, () => {
    userCallCount = 0
    const userId = useUsers.user.id
    expect(userId).toBe(2)
    expect(0).toBe(userCallCount)
  })
})
