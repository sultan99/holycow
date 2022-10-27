import {createSubscription, isNotEqual} from '.'

describe(`📫 Subscription`, () => {
  const a = {id: 1, name: `Rick`}
  const b = {id: 2, name: `Rick`}
  const hasChange = isNotEqual(a, b)
  const [subscribers, addSubscriber] = createSubscription()

  it(`should compare two objects`, () => {
    expect(hasChange(`id`)).toBeTruthy()
    expect(hasChange(`name`)).toBeFalsy()
  })

  it(`should trigger callback function only for changed values`, () => {
    const callbackName = jest.fn()
    const callbackId = jest.fn(state => {
      expect(state.id).toBe(2)
    })

    const unsubscribeId = addSubscriber([`id`], callbackId)
    const unsubscribeName = addSubscriber([`name`], callbackName)

    subscribers.forEach(subscriber => subscriber(a, a)) // no changes
    subscribers.forEach(subscriber => subscriber(a, b))
    expect(callbackId).toHaveBeenCalledTimes(1)
    expect(callbackName).toHaveBeenCalledTimes(0)
    expect(subscribers.size).toBe(2)

    unsubscribeId()
    expect(subscribers.size).toBe(1)

    unsubscribeName()
    expect(subscribers.size).toBe(0)
  })
})
