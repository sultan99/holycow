import type {Any} from '../core/types'
import type {Cache, Computed} from './types'

import {createProxy, getTrackedProps} from '../proxy'
import {pick} from '../fp'

const computeFns = new WeakSet<Computed<any, any>>()

export const isComputed = (fn: Computed<any, any>) => computeFns.has(fn)

/**
 * Computed values are cached
 * inputs of computing function are used as cache keys
 */
export const computed = <T extends Any, R>(fn: (state: T) => R) => {
  let usedProps: string[]
  const cache: Cache<R> = []

  const checkCache = (proxy: T) => cache.findIndex(
    ([propValues]) => usedProps?.every(
      (prop, index) => propValues[index] === pick(prop, proxy)
    )
  )

  const compute = (state: T) => {
    const proxy = createProxy(state, {trackProps: usedProps === undefined})
    const index = checkCache(proxy)
    const notInCache = index < 0

    if (notInCache) {
      const computedValue = fn(proxy)
      usedProps ??= getTrackedProps(proxy)

      const propValues = usedProps.map(prop => pick(prop, proxy))
      cache.push([propValues, computedValue])
      cache.length > 2 && cache.shift() // keep previous & current state in the cache
      return computedValue
    }

    return cache[index][1]
  }

  computeFns.add(compute)
  return compute
}
