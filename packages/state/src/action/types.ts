import type {ProxyState} from '../proxy/types'
import type {State} from '../core/types'
import type {ValOrFunc} from '../fp/types'

export type SetPayload<P> = P extends string ? P : never

export type Action<I, A = any> = (state: ProxyState<State<I>>) =>
  A extends any[]
    ? (...args: A) => void
    : A extends SetPayload<A>
      ? (payload: ValOrFunc<I, A>) => void
      : A
