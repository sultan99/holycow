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
  const mainCache: Cache<R> = []
  const hookCache: any[] = []

  const callHook = (isHook: boolean, index: number) => (hook: any) => {
    index ++
    if (isHook) hookCache[index] = hook()
    return hookCache[index]
  }

  const checkCache = (proxy: T) => mainCache.findIndex(
    ([propValues]) => usedProps?.every(
      (prop, index) => propValues[index] === pick(prop, proxy)
    )
  )

  const compute = (state: T, isHook = false) => {
    const proxy = createProxy(state, {trackProps: !usedProps, isHook})
    const index = checkCache(proxy)
    const notInCache = index < 0

    if (notInCache || isHook) {
      const computedValue = fn(proxy, callHook(isHook, -1))
      usedProps ??= getTrackedProps(proxy)

      const propValues = usedProps.map(prop => pick(prop, proxy))
      mainCache.unshift([propValues, computedValue])
      mainCache.length > 2 && mainCache.pop() // keep previous & current states
      return computedValue
    }

    return mainCache[index][1]
  }

  computeFns.add(compute)
  return compute
}
