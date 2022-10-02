import type {Action} from '../action/types'
import type {Computed} from '../computed/types'
import type {GetTrackedProps, ProxyOptions, ProxyState, TrackProperty} from './types'
import type {Any, State} from '../core/types'

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
          const proxyState = createProxy(state)
          return <P>(...args: P[]) => action(proxyState)(...args)
        }

        const {trackProps, parentProxy, parentProp} = opts
        const proxyState = parentProxy || receiver
        const propPath = parentProp ? `${parentProp}.${key}` : key

        if (trackProps) {
          trackProperty(proxyState, propPath)
        }

        if (!isComputed(value)) {
          return value
        }

        const compute: Computed<T, any> = value
        const computedValue = compute(target)
        if (trackProps && isObject(computedValue)) {
          trackedProps.get(proxyState).delete(propPath) // child will include parent property name
          return createProxy(computedValue, {
            parentProp: key,
            parentProxy: proxyState,
            trackProps
          })
        }

        return computedValue
      },
    })
  )
