import * as R from 'ramda'
import {act, renderHook} from '@testing-library/react-hooks'
import {createState, computed, action} from '.'
import {renderHookWithCount} from './utils'

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

// avoid first creation time in tests reports
test(`Heat up renderHook`, () => {
  renderHook(() => {
    const {selectedId, user, users} = useUsers()
    return {selectedId, user, users}
  })
  expect(userCallCount).toBe(1)
})

describe(`Action creator`, () => {
  test(`simple`, () => {
    createState({
      setId: action(set => set(`selectedId`)),
    })
    expect(1).toBe(1) // TODO
  })

  test(`action creator`, () => {
    createState({
      setId: action(({set}, state) => set(`selectedId`)),
    })
    expect(1).toBe(1) // TODO
  })

  test(`action creator`, () => {
    createState({
      setId: action(({set}, state) => set(`selectedId`)),
    })
    expect(1).toBe(1) // TODO
  })
})

describe(`State setter`, () => {
  test(`set single value`, () => {
    userCallCount = 0
    const {result, renderCount} = renderHookWithCount(() => {
      const {likedId, set} = useUsers()
      return {likedId, set}
    })

    const {set} = result.current
    expect(userCallCount).toBe(0)
    expect(renderCount()).toBe(1)

    act(() => set(`likedId`, 2))
    expect(result.current.likedId).toBe(2)
    expect(userCallCount).toBe(0)
    expect(renderCount()).toBe(2)
  })

  test(`set value via function`, () => {
    userCallCount = 0
    const {result, renderCount} = renderHookWithCount(() => {
      const {set, user, users} = useUsers()
      return {set, user, users}
    })

    const {set} = result.current
    expect(userCallCount).toBe(0)
    expect(renderCount()).toBe(1)

    act(() => set(`users`, R.append({id: 5, name: `Bob`})))
    expect(result.current.users).toEqual([
      {id: 1, name: `John`},
      {id: 2, name: `Jane`},
      {id: 5, name: `Bob`},
    ])
    expect(userCallCount).toBe(1)
    expect(renderCount()).toBe(2)
  })

  test(`set multiple values`, () => {
    userCallCount = 0
    const {result, renderCount} = renderHookWithCount(() => {
      const {set, likedId, selectedId} = useUsers()
      return {set, likedId, selectedId}
    })

    const {set} = result.current
    expect(renderCount()).toBe(1)

    act(() => set({likedId: 1, selectedId: 1}))
    expect(result.current.likedId).toBe(1)
    expect(result.current.selectedId).toBe(1)
    expect(renderCount()).toBe(2)
  })

  test(`set value via path`, () => {
    expect(1).toBe(1) // TODO
  })

  test(`no change, no render`, () => {
    userCallCount = 0
    const {result, renderCount} = renderHookWithCount(() => {
      const {set, user} = useUsers()
      return {set, user}
    })

    const {set} = result.current
    expect(userCallCount).toBe(0)
    expect(renderCount()).toBe(1)

    act(() => set(`users`, R.append({id: 6, name: `Ricky`})))
    expect(result.current.user).toEqual({id: 1, name: `John`})
    expect(userCallCount).toBe(1) // computed function was called
    expect(renderCount()).toBe(1) // but no rerender, because no change of the value
  })
})

describe(`State reset`, () => {
  test(`override value`, () => {
    const {result} = renderHook(() => {
      const {likedId, reset, selectedId, user, users} = useUsers()
      return {likedId, reset, selectedId, user, users}
    })

    const {reset} = result.current
    expect(reset).toEqual(expect.any(Function))

    act(() => reset({selectedId: 1}))
    expect(result.current.likedId).toBe(1)
    expect(result.current.selectedId).toBe(1)
    expect(result.current.user).toEqual({id: 1, name: `John`})
    expect(result.current.users).toEqual([
      {id: 1, name: `John`},
      {id: 2, name: `Jane`},
    ])
  })

  test(`full state reset`, () => {
    const {result} = renderHook(() => {
      const {likedId, reset, selectedId, user, users} = useUsers()
      return {likedId, reset, selectedId, user, users}
    })
    const {reset} = result.current

    act(() => reset())
    expect(result.current.likedId).toBe(1)
    expect(result.current.selectedId).toBe(2)
    expect(result.current.user).toEqual({id: 2, name: `Jane`})
    expect(result.current.users).toEqual([
      {id: 1, name: `John`},
      {id: 2, name: `Jane`},
    ])
  })
})
