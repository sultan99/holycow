import * as R from 'ramda'
import {useEffect, useState} from 'react'
import {CreateState, Hook, ProxyState, Set, Update, Updaters, UseValue} from './types'

const isFunction = R.is(Function) as (x: unknown) => x is Function
const isString = R.is(String) as (x: unknown) => x is String

const pickStateKeys = R.pipe(
  R.reject(isFunction),
  R.keys,
)

export const createState: CreateState = <S>(initState: S): Hook<S> => {
  let state = {...initState}
  const stateKeys = pickStateKeys(initState) as (keyof S)[]
  const updaters: Updaters<S> = {} as S

  const set: Set<S> = R.curry(<K extends keyof S>(a: K | Update<S>, b?: any): void => {
    if (isString(a) && isFunction(initState[a as K])) {
      throw new Error(`Attempt to update computed value or action.`)
    }
    const updateState = (false
      || isString(a) && isFunction(b) && R.over(R.lensProp(a as K), b)
      || isString(a) && R.set(R.lensProp(a as K), b)
      || isFunction(a) && a
      || R.always(a)
    ) as Update<S>

    const next = updateState(state)
    stateKeys.forEach((key: keyof S) => {
      const updater = updaters[key]
      const shouldUpdate = updater && !R.equals(state[key], next[key])
      shouldUpdate && updater.map(R.applyTo(next[key]))
    })
    state = next
  })

  const useValue: UseValue<S> = name => {
    const [value, setValue] = useState(state[name])
    useEffect(() => {
      const updater = updaters[name]
      updater?.push(setValue) ?? (updaters[name] = [setValue])

      return () => {
        const index = updater?.findIndex(R.equals(setValue)) ?? -1
        const canRemove = index > -1
        canRemove && updater.splice(index, 1)
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
