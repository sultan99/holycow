export type State<T> = Pick<T, SkipAction<T>>

export type ProxyState<T> = Set<T> & {
  set: Set<T>
} & {
  [K in keyof T]: T[K] extends (
    | Action<T>
    | ActionPayload<T, any>
    | Computed<T, any>
  ) ? ReturnType<T[K]> : T[K]
}

export type CreateState = <S extends Record<string, any>>(opts: S) => Hook<S>

export type SelStatic<S, K = keyof State<S>> = `@` | `@${K & string}`

export type Hook<T> = {
  () : ProxyState<T>
  <K extends keyof T>(sel?: K): ProxyState<T>[K & keyof T]
  <U extends SelStatic<T>>(sel?: U):
    U extends `@` ? State<T> :
    U extends `@${infer K}` ? K extends keyof State<T> ? State<T>[K & keyof T] : never : never
}

export type Action<S> = (set: ProxyState<S>) => () => ((s: ProxyState<S>) => void) | void
export type ActionPayload<S, P> = (set: ProxyState<S>) => (payload: P) => ((s: ProxyState<S>) => void) | void // eslint-disable-line
export type Computed<S, R> = (state: ProxyState<S>) => R
export type ComputedPayload<S, P, R> = (state: ProxyState<S>) => (payload: P) => R
export type Update<T> = (s: T) => T
export type Updaters<T> = Record<keyof T, any>
export type UseValue<T> = <K extends keyof T>(prop: K) => T[K]

export type Set<T> = {
  <K extends keyof T>(prop: K, val: T[K]): void
  <K extends keyof T>(prop: K): (val: T[K]) => void
  <K extends keyof T>(prop: K, fn: Update<T[K]>): void
  <K extends keyof T>(prop: K): (fn: Update<T[K]>) => void
  (f: Update<T>): void
  (s: T): void
}

export type SkipAction<T> = {
  [K in keyof T]: T[K] extends (Action<T> | ActionPayload<T, any>) ? never : K
}[keyof T]

export type SetLike<T> = <K extends keyof T>(a: K | Update<T>, b?: any) => void

export type CurredSetLike<T> = <K extends keyof T>(a: K | Update<T>, b?: any) =>
  | ((c?: any) => void)
  | void
