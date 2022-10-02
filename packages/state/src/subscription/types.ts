export type AddSubscribe = (props: string[], callback: any) => () => void

export type CreateSubscription = () => [Set<Subscribe>, AddSubscribe]

export type Subscribe = <T>(currentState: T, nextState: T) => void

export type IsNotEqual = <T>(a: T, b: T) => (prop: string) => boolean
