import {ProxyState} from '../proxy/types'

/**
 * Cache = [
 *  [`state.prop1`, `state.prop2`], computedValue]`],
 *  [`state.prop1`, `state.prop2`], computedValue]`],
 * ]
 */
export type Cache<T> = [any[], T][]

export type Computed<I, R> = (state: ProxyState<I>) => R

export type ComputedValue<T> = T extends Computed<any, any> ? ReturnType<T> : T
