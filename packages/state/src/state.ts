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
  const deps = []
  const state = {}
  const stateKeys = []
  const subscriberList = [] // one callback -> f(state), many keys: [[`key1`, `key2`], f]
  const subscribers = {} // one key, many callbacks -> fn(state[key]): {key: [f1, f1]}

  const set = curry((first, second?: any) => {
    const updateState = (
      isString(first) && isFunction(second) && R.over(R.lensPath(first.split(`.`)), second) ||
      isString(first) && R.set(R.lensPath(first.split(`.`)), second) ||
      isFunction(first) && first ||
      isObject(first) && (prev => ({...prev, ...first}))
    )
    const nextState = proxify(updateState(state), computes)
    const keysToUpdate = isString(first) ?
      deps.reduce((acc, [key, list]) => {
        list.includes(first) && acc.push(key)
        return acc
      }, []) :
      stateKeys

    const updatedKeys = []
    keysToUpdate.forEach(key => {
      const value = nextState[key]
      if (state[key] === value) return
      state[key] = value
      updatedKeys.push(key)
    })

    const updatedSubscribers = []
    updatedKeys.forEach(key => {
      subscribers[key]?.forEach(callback => callback(state[key]))
      subscriberList.forEach(([keys, callback], index) => {
        if (updatedSubscribers[index] || !keys.includes(key)) return
        callback(state)
        updatedSubscribers[index] = true
      })
    })
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
    deps.push([key, keys])
  })

  const reset = (override = {}) => {
    const next = {...initState, ...override}
    set(() => next, null)
  }

  const subscribe = (key, callback) => {
    if (isArray(key)) {
      subscriberList.push([key, callback])
      return
    }
    if (!subscribers[key]) {
      subscribers[key] = []
    }
    if (!subscribers[key].includes(callback)) {
      subscribers[key].push(callback)
    }
  }

  const unsubscribe = (key, callback) => {
    if (isArray(key)) {
      const index = subscriberList.findIndex(([, fn]) => fn === callback)
      subscriberList.splice(index, 1)
      return
    }
    const index = subscribers[key]?.findIndex(isEqual(callback))
    index >= 0 && subscribers[key]?.splice(index, 1)
  }

  const reservedFunc = {
    set, reset,
    subscribe, unsubscribe,
  }

  return new Proxy(state, {
    get: (target, key) =>
      actions?.[key] ??
      reservedFunc?.[key] ??
      target[key]
  })
}

export const createHook = holyState => (...selectors) => {
  const keys = selectors.concat()
  const [value, setValue] = useState(selectors.length
    ? holyState
    : trackKeys(holyState, keys)
  )

  useEffect(() => {
    const {subscribe, unsubscribe} = holyState
    subscribe(keys, setValue)
    return () => {
      unsubscribe(keys, setValue)
    }
  }, [])

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
