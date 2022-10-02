import type {InitState, Setter, State, StaticProps, UseHook} from './types'
import type {ProxyState} from '../proxy/types'

import {compose, pick, update} from '../fp'
import {createProxy, getTrackedProps} from '../proxy'
import {createSubscription} from '../subscription'
import {isAction} from '../action'
import {isComputed} from '../computed'
import {isFunction, isObject, isString} from '../fp'
import {useEffect, useState} from 'react'

const curry = (fn: any) => (a: any, b?: any) => {
  if (isObject(a) || isFunction(a)) return fn(a)
  if (isString(a) && b === undefined) return (c: any) => fn(a, c)
  return fn(a, b)
}

export const createState = <I extends InitState>(initState: I) => {
  type S = State<I>
  const state = {...initState} as S
  const proxyState = createProxy(state)
  const [subscribers, addSubscriber] = createSubscription()
  const staticProps = Object.keys(initState).filter(key =>
    !isAction(initState[key]) && !isComputed(initState[key])
  )

  state.set = curry((a: any, b: any) => {
    const updateState = (
      isFunction(a) && a ||
      isString(a) && update(a, b) ||
      compose(
        (Object
          .entries(a)
          .map(([key, value]) => update<string, any>(key, value))
        ) as any
      )
    )
    const nextState = createProxy(updateState(state))
    subscribers.forEach(subscriber => subscriber(proxyState, nextState))
    staticProps.forEach(prop => state[prop as keyof I] = nextState[prop])
  }) as Setter<StaticProps<I>>

  state.reset = (override = {}) => {
    const next = {...initState, ...override}
    state.set(() => next)
  }

  state.subscribe = (prop: string, fn: any) => {
    const props: string[] = isString(prop) ? [prop] : staticProps
    const callback = isFunction(prop) ? prop : compose(fn, pick(prop))
    return addSubscriber(props, callback)
  }

  const useHook = (...selectors: string[]) => {
    const [value, setValue] = useState(createProxy(state, {trackProps: true}))

    useEffect(() => {
      const props: string[] = getTrackedProps(value)
      return addSubscriber(props, setValue)
    }, [])

    return (
      selectors.length === 0 && value ||
      selectors.length === 1 && pick(selectors[0], value) ||
      selectors.map(selector => pick(selector, value))
    )
  }

  return new Proxy(useHook, {
    get: (_target, prop: string) => proxyState[prop]
  }) as UseHook<S> & ProxyState<S>
}
