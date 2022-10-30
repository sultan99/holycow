import {clearSignal, createSignal, on, once, signals} from '.'

type Todo = {
  id: number
  text: string
}

type AddTodo = (todo: Todo) => void

const addTodo = createSignal<AddTodo>()

const todo = {
  id: 1,
  text: `Buy milk`
}

afterEach(() => {
  signals.clear()
  jest.clearAllMocks()
})

const callback = jest.fn(
  payload => {
    expect(payload).toEqual(todo)
  }
)

describe(`📢 Signal events`, () => {
  it(`should listen to a signal`, () => {
    on(addTodo, callback)
    on(addTodo, callback)

    addTodo(todo)
    expect(signals.get(addTodo).length).toBe(2)
    expect(callback.mock.calls.length).toBe(2)
  })

  it(`should listen to one time use signal`, () => {
    once(addTodo, callback)
    expect(signals.size).toBe(1)

    addTodo(todo)
    addTodo(todo) // should not trigger callback
    expect(signals.size).toBe(0)
    expect(callback.mock.calls.length).toBe(1)
  })

  it(`should clear a specific signal`, () => {
    const off = on(addTodo, callback)

    addTodo(todo)
    expect(callback.mock.calls.length).toBe(1)

    off()
    addTodo(todo)
    expect(signals.get(addTodo).length).toBe(0)
    expect(callback.mock.calls.length).toBe(1)
  })

  it(`should clear all signals`, () => {
    on(addTodo, callback)
    on(addTodo, callback)
    expect(signals.get(addTodo).length).toBe(2)

    clearSignal(addTodo)
    expect(callback.mock.calls.length).toBe(0)
  })
})
