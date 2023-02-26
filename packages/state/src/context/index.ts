import type {InitState, State, UseHook} from '../core/types'
import type {ProviderProps} from './types'

import {createElement, createContext} from 'react'
import {createState} from '../core'
import {isFunction, isObject} from '../fp'
import {useContext, useEffect, useRef, useMemo} from 'react'

const hooks = new WeakMap()

export const createContextState = <I extends InitState>(initState: I) => {
  const Context = createContext({current: NaN})
  const hook = <A>(...args: A[]) => hooks.get(useContext(Context))?.apply(...args)

  const Provider = <T extends InitState>({value, children}: ProviderProps<T>) => {
    const id = useRef(NaN)
    if (value !== undefined && !isObject(value)) {
      throw new Error(`🚨 Context value must be an object`)
    }
    if (isNaN(id.current)) {
      id.current = Date.now() + Math.random()
      hooks.set(id, createState<I>(Object.assign({}, initState, value)))
    }

    useEffect(() => {
      if (!value) return
      const nextValue = Object.keys(value).reduce((acc, key) => {
        if (!isFunction(value[key])) acc[key] = value[key]
        return acc
      }, {})
      hooks.get(id).set(nextValue)
    }, [value])

    return createElement(Context.Provider, {
      value: id,
      children: useMemo(() => children, [])
    })
  }

  return [Provider, hook] as [typeof Provider, UseHook<State<I>>]
}
