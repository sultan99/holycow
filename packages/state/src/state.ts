import * as R from 'ramda'
import {useEffect, useState} from 'react'
import {CreateState, CurredSetLike, Hook, ProxyState} from './types'
import {Set, SetLike, Update, Updaters, UseValue} from './types'

const isFunction = R.is(Function) as (x: unknown) => x is Function
const isString = R.is(String) as (x: unknown) => x is String

const curry = <T>(fn: SetLike<T>): CurredSetLike<T> => (a, b) => {
  if (isFunction(a)) {
    return fn(a)
  }
  if (b === undefined) {
    return (c: any) => fn(a, c)
  }
  return fn(a, b)
}

export const createState: CreateState = <S>(initState: S): Hook<S> => {
  const state = {...initState}
  const stateKeys = Object.keys(initState).filter(isFunction) as (keyof S)[]
  const updaters: Updaters<S> = {} as S

  const set: Set<S> = curry((a: keyof S | Update<S>, b) => {
    if (isString(a) && isFunction(initState[a as keyof S])) {
      throw new Error(`Attempt to update computed value or action.`)
    }
    const updateState = (false
      || isString(a) && isFunction(b) && R.over(R.lensPath(a.split(`.`)), b)
      || isString(a) && R.set(R.lensPath(a.split(`.`)), b)
      || isFunction(a) && a
    ) as Update<S>

    const next = updateState(state)
    stateKeys.forEach((key: keyof S) => {
      const updater = updaters[key]
      const shouldUpdate = updater && !R.equals(state[key], next[key])
      shouldUpdate && updater.map(R.applyTo(next[key]))
      state[key] = next[key]
    })
  }) as Set<S>

  const useValue: UseValue<S> = name => {
    const [value, setValue] = useState(state[name])
    useEffect(() => {
      const updater = updaters[name]
      updater?.push(setValue) ?? (updaters[name] = [setValue])

      return () => {
        const upd = updaters[name]
        const index = upd?.findIndex(R.equals(setValue)) ?? -1
        const canRemove = index > -1
        canRemove && upd.splice(index, 1)
      }
    }, [])
    return value
  }

  const stateProxy = new Proxy(set, {
    get: (ref, key: keyof S & string) => {
      if (key === `set`) return set
      const target = initState[key]
      if (isFunction(target)) {
        const first = target(stateProxy)
        if (isFunction(first)) {
          return <P>(payload: P) => {
            const second = first(payload)
            const result = isFunction(second) ? second(state) : second
            state[key] = result
            return state[key]
          }
        }
        state[key] = first
        return state[key]
      }
      return useValue(key)
    }
  }) as ProxyState<S>

  return (selector?: any): any => {
    if (selector === `@`) return state
    if (selector?.startsWith(`@`)) {
      const path = selector.replace(`@`, ``).split(`.`)
      return R.path(path, state)
    }
    if (isString(selector)) {
      const path = selector.split(/\./)
      return R.path(path, stateProxy)
    }
    return stateProxy
  }
}
