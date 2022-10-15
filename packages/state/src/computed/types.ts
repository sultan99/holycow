import {ProxyState} from '../proxy/types'

export type Cache<T> = [any[], T][]

export type CallHook = <T>(fn: () => T) => T

export type Computed<I, R> = (state: ProxyState<I>, isHook: boolean) => R

export type ComputedValue<T> = T extends Computed<any, any> ? ReturnType<T> : T
