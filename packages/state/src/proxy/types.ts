import type {ComputedValue} from '../computed/types'

/**
 * ProxyState is similar to State type,
 * except computed values will be calculated (tracked & cached)
 */
export type ProxyState<T> = {
  [K in keyof T]: K extends `set` | `reset` | `subscribe` ? T[K] : ComputedValue<T[K]>
}

export type ProxyOptions<T> = {
  parentProp?: string
  parentProxy?: ProxyState<T>
  trackProps?: boolean
}

export type TrackProperty = <T>(proxy: ProxyState<T>, path: string) => void

export type GetTrackedProps = <T>(proxy: ProxyState<T>) => string[]
