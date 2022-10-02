import type {AddSubscribe, CreateSubscription, IsNotEqual, Subscribe} from './types'
import {pick} from '../fp'

const isNotEqual: IsNotEqual = (a, b) => prop => pick(prop, a) !== pick(prop, b)

export const createSubscription: CreateSubscription = () => {
  const subscribers = new Set<Subscribe>()

  const addSubscriber: AddSubscribe = (props, callback) => {
    const subscriber: Subscribe = (currentState, nextState) => {
      const hasChanges = props.some(isNotEqual(currentState, nextState))
      hasChanges && callback(nextState)
    }
    subscribers.add(subscriber)

    return () => subscribers.delete(subscriber)
  }

  return [subscribers, addSubscriber]
}
