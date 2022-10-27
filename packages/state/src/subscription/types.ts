import {Any} from '../core/types'
import {Dispatch, SetStateAction} from 'react'

export type Callback<S> = Dispatch<SetStateAction<S>> | ((state: S) => S)

export type AddSubscribe = (props: string[], callback: Callback<any>) => () => void

export type CreateSubscription = () => [Set<Subscribe>, AddSubscribe]

export type Subscribe = <T extends Any>(currentState: T, nextState: T) => void

export type IsNotEqual = <T>(a: T, b: T) => (prop: string) => boolean
