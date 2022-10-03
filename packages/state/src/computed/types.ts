import {ProxyState} from '../proxy/types'

export type Cache<T> = [any[], T][]

export type Computed<I, R> = (state: ProxyState<I>) => R

export type ComputedValue<T> = T extends Computed<any, any> ? ReturnType<T> : T
