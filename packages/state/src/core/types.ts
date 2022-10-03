import type {Computed} from '../computed/types'
import type {ProxyState} from '../proxy/types'
import type {TypeFromPath, ValOrFunc} from '../fp/types'

type Update<I, P> = (value: TypeFromPath<StaticProps<I>, P>) => void

type Subscribe<T> = <P extends string>(path: P, update: Update<T, P>) => void

export type Any = Record<string | symbol, any>

export type InitState = Record<string | symbol, any>

export type State<I> = I & {
  set: Setter<StaticProps<I>>
  reset: (override?: Partial<StaticProps<I>>) => void
  subscribe: Subscribe<I>
}

export type StaticProps<T> = {
  [K in keyof T as T[K] extends Computed<T, any> ? never : K]: T[K]
}

export type UpdateState<S> = (state: S) => S

export interface Setter<I> {
  (fn: () => void): void
  <P extends string>(path: P, payload: ValOrFunc<I, P, never>): void
  <P extends string>(path: P): (payload: ValOrFunc<I, P, never>) => void
}

export type UseHook<S> = <P extends string[]>(...sel: P) => (
  P extends []
    ? ProxyState<S>
    : P extends [infer F, ...infer R]
      ? R extends []
        ? TypeFromPath<ProxyState<S>, P[0]>
        : {[Index in keyof P]: TypeFromPath<ProxyState<S>, P[Index], never>}
      : never
)
