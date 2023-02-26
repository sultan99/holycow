import type {ProxyState, UseHook} from '../'

import {act} from 'react-dom/test-utils'
import {createElement} from 'react'
import {createRoot, Root} from 'react-dom/client'

let root: Root
let container: HTMLDivElement

beforeEach(() => {
  container = document.createElement(`div`)
  root = createRoot(container)
  document.body.appendChild(container)
})

afterEach(() => {
  act(() => root.unmount())
  document.body.removeChild(container)
})

type HookLike<S> =
  | (UseHook<S> & ProxyState<S>)
  | (() => ProxyState<S>)

export const renderHook = <S>(hook: HookLike<S>) => {
  let count = 0
  const result = {} as ProxyState<S>
  const renderCount = () => count

  const TestComponent = () => {
    count ++
    const hookResult = hook()
    Object.keys(hookResult).forEach(
      key => result[key] = hookResult[key]
    )

    return createElement(`div`)
  }

  const rerender = () => act(
    () => root.render(createElement(TestComponent))
  )

  const unmount = () => act(
    () => root.unmount()
  )

  rerender()

  return {renderCount, rerender, result, unmount}
}
