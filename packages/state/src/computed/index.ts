import type {Any} from '../core/types'
import type {Cache, Computed, CallHook} from './types'

import {createProxy, getTrackedProps} from '../proxy'
import {pick} from '../fp'

const computeFns = new WeakSet<Computed<any, any>>()

export const isComputed = (fn: Computed<any, any>) => computeFns.has(fn)

/**
 * Computed values are cached
 * inputs of computing function are used as cache keys
 */
export const computed = <T extends Any, R>(fn: (state: T, safeCall: CallHook) => R) => {
  let usedProps: string[]
  const cache: Cache<R> = []
  const seCache: any[] = []

  const sideEffect = (isHook: boolean, index: number) => (hook: any) => {
    index ++
    if (isHook) seCache[index] = hook()
    return seCache[index]
  }

  const checkCache = (proxy: T) => cache.findIndex(
    ([propValues]) => usedProps?.every(
      (prop, index) => propValues[index] === pick(prop, proxy)
    )
  )

  const compute = (state: T, isHook = false) => {
    const proxy = createProxy(state, {trackProps: !usedProps, isHook})
    const index = checkCache(proxy)
    const notInCache = index < 0

    if (notInCache || isHook) {
      const computedValue = fn(proxy, sideEffect(isHook, -1))
      usedProps ??= getTrackedProps(proxy)

      const propValues = usedProps.map(prop => pick(prop, proxy))
      cache.unshift([propValues, computedValue])
      cache.length > 2 && cache.pop() // keep previous & current states
      return computedValue
    }

    return cache[index][1]
  }

  computeFns.add(compute)
  return compute
}
