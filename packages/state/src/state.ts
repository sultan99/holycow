import * as R from 'ramda'
import {useEffect, useState} from 'react'

export const ACTION_TYPE = Symbol(`action`)
export const COMPUTED_TYPE = Symbol(`computed`)
export const HOLY_TYPE = Symbol(`holy-state`)
export const LINK_TYPE = Symbol(`link`)

const isFunction = R.is(Function)
const isString = R.is(String)
const isAction = fn => fn && fn.type === ACTION_TYPE
const isComputed = fn => fn && fn.type === COMPUTED_TYPE
const isHookyFunction = fn => isFunction(fn) && !isComputed(fn)
const isObject = value => typeof value === `object`
const isEqual = a => b => a === b

const addType = type => fn => {
  const fnComp = (...args) => fn(...args)
  fnComp.type = type
  return fnComp
}

export const action = addType(ACTION_TYPE)
export const computed = addType(COMPUTED_TYPE)
export const link = addType(LINK_TYPE)(
  hook => addType(LINK_TYPE)(
    key => addType(LINK_TYPE)(
      set => {
        hook.subscribe(key, set)
        return hook(`@${key}`)
      }
    )
  )
)

const curry = fn => (a, b) => {
  if (isObject(a) || isFunction(a)) return fn(a, b)
  if (isString(a) && b === undefined) return c => fn(a, c)
  return fn(a, b)
}

export const createState = initState => {
  const state = {}
  const deps = []
  const stateKeys = []
  const subscribers = {} // one key, many callbacks -> fn(state[key]): {key: [f1, f1]}
  const subscriberList = [] // one callback -> f(state), many keys: [[`key1`, `key2`], f]

  Object.keys(initState).forEach(key => {
    if (isAction(initState[key])) return
    const list = []
    const proxyState = proxify(initState, list, true)
    state[key] = proxyState[key]
    stateKeys.push(key)
    deps.push([key, list])
  })

  const set = curry((first, second?: any) => {
    const updatedKeys = []
    const updatedSubscribers = []
    const updateState = (false
      || isString(first) && isFunction(second) && R.over(R.lensPath(first.split(`.`)), second)
      || isString(first) && R.set(R.lensPath(first.split(`.`)), second)
      || isFunction(first) && first
      || isObject(first) && (prev => ({...prev, ...first}))
    )
    const nextProxyState = proxify(updateState(state), null, true)
    const keysToUpdate = isString(first) ?
      deps.reduce((acc, [key, list]) => {
        list.includes(first) && acc.push(key)
        return acc
      }, []) :
      stateKeys
    keysToUpdate.forEach(key => {
      const value = nextProxyState[key]
      if (state[key] === value) return
      state[key] = value
      updatedKeys.push(key)
    })
    updatedKeys.forEach(key => {
      subscribers[key]?.forEach(callback => callback(state[key]))
      subscriberList.forEach(([keys, callback], index) => {
        if (updatedSubscribers[index] || !keys.includes(key)) return
        callback(state)
        updatedSubscribers[index] = true
      })
    })
  })

  const reset = (override = {}) => {
    const next = {...initState, ...override}
    set(() => next)
  }

  const useHolyState = (...selectors) => {
    const keys = selectors.length ? selectors : []
    const [value, setValue] = useState(() => proxify(state, keys))
    useEffect(() => {
      const uniqueKeys = Array.from(new Set(keys))
      const length = subscriberList.push([uniqueKeys, setValue])
      return () => {
        subscriberList.splice(length - 1, 1)
      }
    }, [])

    return (
      selectors.length === 0 ? value :
        selectors.length === 1 ? R.path(selectors[0].split(`.`), value) :
          selectors.map(path => R.path(path.split(`.`), value))
    )
  }

  function proxify(target, keys?, calculate = false) {
    return new Proxy(target, {get(tr, key) {
      const targetValue = tr[key]
      if (key === `set`) return set
      if (key === `reset`) return reset
      if (!isAction(initState[key])) {
        keys?.push(key)
      }
      if (calculate && isComputed(initState[key])) {
        const value = initState[key](proxify(target, keys, true))
        return value
      }
      if (isAction(targetValue)) {
        return targetValue(set, tr)
      }
      if (isHookyFunction(targetValue)) {
        return targetValue(proxify(target, keys))
      }
      return tr[key]
    }})
  }

  const subscribe = (key, setter) => {
    if (!subscribers[key]) {
      subscribers[key] = []
    }
    if (!subscribers[key].includes(setter)) {
      subscribers[key].push(setter)
    }
  }

  const unsubscribe = (key, setter) => {
    const index = subscribers[key]?.findIndex(isEqual(setter))
    subscribers[key].splice(index, 1)
  }

  const reservedFunc = {set, reset, subscribe, unsubscribe}

  return new Proxy(useHolyState, {
    get: (_, key) => (
      reservedFunc?.[key] ??
      state?.[key] ??
      initState[key]
    )
  })
}

export const createHook = holyState => (...selectors) => {
  const keys = selectors.length ? selectors : []
  const [value, setValue] = useState(() => proxify(state, keys))
  useEffect(() => {
    const uniqueKeys = Array.from(new Set(keys))
    const length = subscriberList.push([uniqueKeys, setValue])
    return () => {
      subscriberList.splice(length - 1, 1)
    }
  }, [])

  return (
    selectors.length === 0 ? value :
      selectors.length === 1 ? R.path(selectors[0].split(`.`), value) :
        selectors.map(path => R.path(path.split(`.`), value))
  )
}
