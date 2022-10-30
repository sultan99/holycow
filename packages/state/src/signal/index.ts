import {Func} from "../fp/types"

const disposable = new Set()
const isDisposable = (signal: Func) => disposable.has(signal)

export const signals = new Map()

export const createSignal = <T = () => void>(): T => {
  const signal: any = (...args: any[]) => {
    signals.get(signal)?.forEach((fn: Func) => fn(...args))

    if (isDisposable(signal)) {
      signals.delete(signal)
      disposable.delete(signal)
    }
  }
  return signal
}

export const on = <T>(signal: T, callback: T) => {
  signals.get(signal)?.push(callback) ?? signals.set(signal, [callback])

  return () => {
    const index = signals.get(signal).indexOf(callback)
    signals.get(signal).splice(index, 1)
  }
}

export const once = <T>(signal: T, callback: T) => {
  signals.get(signal)?.push(callback) ?? signals.set(signal, [callback])
  disposable.add(signal)
}

export const clearSignal = <T>(signal: T) => {
  signals.set(signal, [])
}
