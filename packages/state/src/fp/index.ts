import type {Append, Func, Pick, Update} from './types'

export const isFunction = (value: any): value is Function => (
  typeof value === `function`
)

export const isObject = (value: any): value is Object => (
  typeof value === `object`
)

export const isString = (value: any): value is string => (
  typeof value === `string`
)

export const curry = (fn: Func) => (...args: any[]) => (
  args.length >= fn.length
    ? fn(...args)
    : curry(fn.bind(undefined, ...args))
)

export const compose = <T extends Func>(...fns: T[]) => <A>(...args: A[]) => (
  fns.reduceRight(
    (x, fn, index) => index === fns.length - 1 ? fn(...x) : fn(x),
    args
  )
)

export const pick: Pick = curry((value: string, obj: any) =>
  value
    .split(`.`)
    .reduce((acc, key) => acc?.[key], obj)
)

const deepUpdate = (keys: string[], fn: any, obj: any | any[]): any => {
  const [key, ...rest] = keys

  if (keys.length === 1) {
    return Array.isArray(obj)
      ? obj.map((v, i) => i.toString() === key ? fn(v) : v)
      : ({...obj, [key]: fn(obj[key])})
  }

  return Array.isArray(obj)
    ? obj.map((v, i) => i.toString() === key ? deepUpdate(rest, fn, v) : v)
    : {...obj, [key]: deepUpdate(rest, fn, obj[key])}
}

export const update: Update = curry(
  (pathDots: string, valueOrFn: any, object: any) =>
    deepUpdate(
      pathDots.split(`.`),
      isFunction(valueOrFn) ? valueOrFn : () => valueOrFn,
      object
    )
)

export const append: Append = curry(
  (value: any, array: any[]) => [...array, value]
)
