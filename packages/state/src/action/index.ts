import type {Action} from './types'

const actionFns = new WeakSet<Action<any, any>>()

export const isAction = <I>(fn: Action<I, any>) => actionFns.has(fn)

export const action = <I, R>(fn: Action<I, R>) => {
  actionFns.add(fn)
  return fn
}
