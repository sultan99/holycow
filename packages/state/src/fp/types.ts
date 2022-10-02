import type {ComputedValue} from '../computed/types'
import type {State} from '../core/types'

export type Func = (...args: any[]) => any

export type TypeFromPath<T, P, R = never> = (
  P extends string
    ? {
      [K in P]: K extends keyof T
        ? K extends keyof State<never> ? T[K] : ComputedValue<T[K]>
        : K extends `${infer F}.${infer S}`
          ? TypeFromPath<ComputedValue<T[F & keyof T]>, S, R>
          : R
      }[P]
    : T
)

type KeyOrPath<T, P> = P extends `${infer F}.${infer S}`
  ? TypeFromPath<T, P, undefined>
  : P extends keyof T ? T[P] : undefined

export interface Pick {
  <P extends string, T>(value: P, obj: T): KeyOrPath<T, P>
  <P extends string>(value: P): <T>(obj: T) => KeyOrPath<T, P>
}

export interface Append {
  <T>(value: T, obj: T[]): T[]
  <T>(value: T): (obj: T[]) => T[]
}

export type ValOrFunc<T, P, R = undefined> =
  | TypeFromPath<T, P, R>
  | ((p: TypeFromPath<T, P, R>) => TypeFromPath<T, P, R>)

export interface Update {
  <P extends string, T>(path: P, value: ValOrFunc<T, P>, obj: T): T
  <P extends string, T>(path: P, value: ValOrFunc<T, P>): (obj: T) => T
  <P extends string, T>(path: P): (value: ValOrFunc<T, P>) => (obj: T) => T
  <P extends string>(path: P): <T>(value: ValOrFunc<T, P>, obj: T) => T
}
