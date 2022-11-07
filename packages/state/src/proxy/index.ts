import type {Action} from '../action/types'
import type {Any, State} from '../core/types'
import type {GetTrackedProps, ProxyOptions, ProxyState, TrackProperty} from './types'

import {isAction} from '../action'
import {isComputed} from '../computed'
import {isObject} from '../fp'

const trackedProps = new WeakMap<ProxyState<any>>()

const trackProperty: TrackProperty = (proxy, propPath) => {
  if (propPath === `set`) return
  if (trackedProps.has(proxy)) trackedProps.get(proxy).add(propPath)
  else trackedProps.set(proxy, new Set([propPath]))
}

export const getTrackedProps: GetTrackedProps = proxy => Array.from(
  trackedProps.get(proxy) || []
)

export const createProxy = <T extends Any>(
  state: T,
  opts: ProxyOptions<T> = {}
): ProxyState<State<T>> => (

    new Proxy(state, {
      get(target, key, receiver: ProxyState<T>) {
        const value = target[key]
        if (typeof key === `symbol`) {
          return value
        }

        if (isAction(value)) {
          const action: Action<T, any[]> = value
          const proxyState = createProxy(target)
          return action(proxyState)
        }

        const {trackProps, parentProxy, parentProp, isHook} = opts
        const proxyState = parentProxy || receiver
        const propPath = parentProp ? `${parentProp}.${key}` : key

        if (trackProps) {
          trackProperty(proxyState, propPath)
        }

        const nextValue = isComputed(value) ? value(target, isHook) : value
        const keepTracking = trackProps && !Array.isArray(nextValue) && isObject(nextValue)

        if (keepTracking) {
          trackedProps.get(proxyState).delete(propPath) // child will include parent property name
          return createProxy(nextValue, {
            parentProp: key,
            parentProxy: proxyState,
            trackProps
          })
        }

        return nextValue
      },
    })
  )
