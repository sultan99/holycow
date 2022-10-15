import {append, compose, isFunction, isObject, isString, pick, update} from '.'
import {postState, Post} from '../test-utils/posts'

describe(`🛠️ Utility functions (fp)`, () => {
  it(`should append a value to array`, () => {
    expect([1, 2]).toEqual(append(2, [1]))
    expect([1, 2]).toEqual(append(2)([1]))
  })

  it(`should create a new function by composing other functions`, () => {
    const modify = compose(
      update<`title`, Post>(`title`, `New title`),
      pick(`posts.0`),
    )
    expect(modify(postState)).toEqual({id: 1, title: `New title`})
  })

  it(`should check value type, is function or not`, () => {
    expect(isFunction(() => 1)).toBeTruthy()
    expect(isFunction(1)).toBeFalsy()
  })

  it(`should check value type, is object or not`, () => {
    expect(isObject({id: 1})).toBeTruthy()
    expect(isObject(1)).toBeFalsy()
  })

  it(`should check value type, is string or not`, () => {
    expect(isString(`hello`)).toBeTruthy()
    expect(isString(123)).toBeFalsy()
  })

  it(`should update an object by given value or function`, () => {
    const numbers = [1, 2, 3, 4, 5]

    expect(update(`1`, n => n + 1, numbers)[1]).toBe(3)
    expect(update(`1`)(n => n + 1, numbers)[1]).toBe(3)
    expect(update<`1`, number[]>(`1`, n => n + 1)(numbers)[1]).toBe(3)
    expect(update<`1`, number[]>(`1`)(n => n + 1)(numbers)[1]).toBe(3)
  })
})
