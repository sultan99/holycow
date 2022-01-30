import * as R from 'ramda'
import {useEffect, useState} from 'react'

export const ACTION_TYPE = Symbol(`action`)
export const COMPUTED_TYPE = Symbol(`computed`)
export const HOLY_TYPE = Symbol(`holy-type`)
export const LINK_TYPE = Symbol(`link`)

const isAction = fn => fn && fn.type === ACTION_TYPE
const isArray = Array.isArray
const isComputed = fn => fn && fn.type === COMPUTED_TYPE
const isEqual = a => b => a === b
const isFunction = R.is(Function)
const isLink = fn => fn && fn.type === LINK_TYPE
const isObject = value => typeof value === `object`
const isString = R.is(String)

const addType = type => fn => {
  const fnComp = (...args) => fn(...args)
  fnComp.type = type
  return fnComp
}

export const action = addType(ACTION_TYPE)
export const computed = addType(COMPUTED_TYPE)

const curry = fn => (a, b) => {
  if (isObject(a) || isFunction(a)) return fn(a, b)
  if (isString(a) && b === undefined) return c => fn(a, c)
  return fn(a, b)
}

const proxify = (state, computes, keys?) => new Proxy(state, {
  get(target, key) {
    keys?.push(key)
    return computes[key]
      ? computes[key](proxify(target, computes, keys))
      : target[key]
  }
})

const trackKeys = (state, keys) => () => new Proxy(state, {
  get: (target, key) => {
    keys.push(key)
    return target[key]
  }
})

export const createState = initState => {
  const actions = {}
  const computes = {}
  const deps = new Map()
  const state = {}
  const stateKeys = []
  const subscribers = new Map()

  const set = curry((first, second?: any) => {
    const updateState = (
      isObject(first) && (prev => ({...prev, ...first})) ||
      isFunction(first) && first ||
      isString(first) && isFunction(second) && R.over(R.lensPath(first.split(`.`)), second) ||
      isString(first) && R.set(R.lensPath(first.split(`.`)), second)
    )
    const nextState = proxify(updateState(state), computes)
    const keysToUpdate = isString(first) ? deps.get(first) : stateKeys // TODO Support atomic update

    const subs = []
    keysToUpdate.forEach(key => {
      const value = nextState[key]
      if (state[key] === value) return
      state[key] = value
      subscribers.has(key) && subs.push(...subscribers.get(key))
    })

    new Set(subs).forEach(setter => setter(state))
  })

  Object.keys(initState).forEach(key => {
    if (isAction(initState[key])) {
      actions[key] = initState[key](set, state)
      return
    }
    if (isLink(initState[key])) {
      state[key] = initState[key](set(key))
      return
    }
    if (isComputed(initState[key])) {
      computes[key] = initState[key]
    }
    const keys = []
    const proxyState = proxify({...initState, ...state}, computes, keys) // TODO
    state[key] = proxyState[key]
    stateKeys.push(key)
    keys.forEach(index =>
      deps.get(index)?.add(key) ??
      deps.set(index, new Set([key]))
    )
  })

  const reset = (override = {}) => {
    const next = {...initState, ...override}
    set(() => next, null)
  }

  const subscribe = (key, func) => {
    const keys = isString(key) ? [key] : key
    const callback = obj => func(
      isString(key) ? obj[key] : obj
    )
    const append = index => {
      subscribers.get(index)?.add(callback) ??
      subscribers.set(index, new Set([callback]))
    }
    keys.forEach(append)

    return () => keys.forEach(
      key => subscribers.get(key)?.delete(callback)
    )
  }

  const reservedFunc = {set, reset, subscribe}

  return new Proxy(state, {
    get: (target, key) =>
      actions?.[key] ??
      reservedFunc?.[key] ??
      target[key]
  })
}

export const createHook = holyState => (...selectors) => {
  const keys = selectors.concat()
  const [value, setValue] = useState(
    selectors.length ? holyState : trackKeys(holyState, keys)
  )

  useEffect(() => holyState.subscribe(keys, setValue), [])

  return (
    selectors.length === 0 && value ||
    selectors.length === 1 && R.path(selectors[0].split(`.`), value) ||
    selectors.map(path => R.path(path.split(`.`), value))
  )
}

export const createLink = holyState => key => addType(LINK_TYPE)(
  setter => {
    holyState.subscribe(key, setter)
    return holyState[key]
  }
)
