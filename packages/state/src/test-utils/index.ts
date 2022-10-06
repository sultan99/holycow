import type {ProxyState, UseHook} from '../'

import {act} from 'react-dom/test-utils'
import {createElement} from 'react'
import {createRoot, Root} from 'react-dom/client'

global.IS_REACT_ACT_ENVIRONMENT = true

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

export const delay = (ms: number) => new Promise(
  resolve => setTimeout(resolve, ms)
)

export const renderHook = <S>(hook: UseHook<S> & ProxyState<S>, ...props: string[]) => {
  let count = 0
  const result = {} as ProxyState<S>
  const renderCount = () => count

  const TestComponent = () => {
    count ++
    const hookResult = hook()
    const keys = props.length ? props : Object.keys(hookResult)
    keys.forEach(key => result[key] = hookResult[key])

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
