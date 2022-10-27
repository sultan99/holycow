import type {Any, InitState, State, UpdateState, UseHook} from './types'
import type {Func} from '../fp/types'
import type {ProxyState} from '../proxy/types'

import {compose, pick, update} from '../fp'
import {createProxy, getTrackedProps} from '../proxy'
import {createSubscription} from '../subscription'
import {isAction} from '../action'
import {isComputed} from '../computed'
import {isFunction, isObject, isString} from '../fp'
import {useEffect, useState} from 'react'

const curry = (fn: Func) => (a: any, b?: any) => {
  if (isObject(a) || isFunction(a)) return fn(a)
  if (isString(a) && b === undefined) return (c: any) => fn(a, c)
  return fn(a, b)
}

const toFunc = (obj: Any): Func[] => Object
  .entries(obj)
  .map(([key, value]) => update(key, value))

export const createState = <I extends InitState>(initState: I) => {
  type S = State<I>
  const state = {...initState} as S
  const proxyState = createProxy((state as I))
  const [subscribers, addSubscriber] = createSubscription()
  const staticProps = Object.keys(initState).filter(key =>
    !isAction(initState[key]) && !isComputed(initState[key])
  )

  state.set = curry((a: any, b: any) => {
    const updateState: UpdateState<S> = (
      isFunction(a) && a ||
      isString(a) && update(a, b) ||
      compose(...toFunc(a))
    )
    const nextState = createProxy(updateState(state))
    subscribers.forEach(subscriber => subscriber(proxyState, nextState))
    staticProps.forEach((prop: keyof I) => state[prop] = nextState[prop])
  })

  state.reset = (override = {}) => {
    const next = {...initState, ...override}
    state.set(() => next)
  }

  state.subscribe = (prop: string | Func, fn?: Func) => {
    const props = isString(prop) ? [prop] : staticProps
    const callback = isFunction(prop) ? prop : compose(fn!, pick(prop))
    return addSubscriber(props, callback)
  }

  const useHook = (...selectors: string[]) => {
    const [value, setValue] = useState(createProxy(state, {trackProps: true, isHook: true}))

    useEffect(() => {
      const props = getTrackedProps(value)
      return addSubscriber(props, setValue)
    }, [])

    return (
      selectors.length === 0 && value ||
      selectors.length === 1 && pick(selectors[0], value) ||
      selectors.map(selector => pick(selector, value))
    )
  }

  return new Proxy(useHook, {
    get: (_target, prop) => proxyState[prop]
  }) as UseHook<S> & ProxyState<S>
}
