import type {Action} from '..'
import {act, createElement} from 'react'
import {action, createContextState, createState, isObject} from '..'
import {createRoot, Root} from 'react-dom/client'
import {fireEvent} from '@testing-library/react'

type CounterState = {
  count: number
  name: string
  increment: Action<CounterState>
}

const reset = <T extends object>(value: T) => {
  Object.keys(value).forEach(key => {
    if (isObject(value[key])) reset(value[key])
    else value[key] = 0
  })
}

const renders = {
  // state 👇🏻 value, the rest variables are render counts
  app: {count: 0, base: 0, button: 0},
  counter: {
    first: {count: 0, base: 0, label: 0, button: 0},
    second: {count: 0, base: 0, label: 0, button: 0},
  }
}

const initState: CounterState = {
  count: 0,
  name: `Untitled`,
  increment: action(({set}) => () =>
    set(`count`, value => value + 1)
  )
}

const useAppState = createState(initState)

const [Context, useCounter] = createContextState(initState)

const Label = () => {
  const {name, count} = useCounter()
  renders.counter[name].count = count
  renders.counter[name].label ++

  return createElement(`h1`, {
    id: `${name}Label`,
    children: count,
  })
}

const Button = () => {
  const {name, increment} = useCounter()
  renders.counter[name].button ++

  return createElement(`button`, {
    id: `${name}Button`,
    onClick: increment,
    children: `Counter button`,
  })
}

const Counter = (value: Partial<CounterState>) => {
  renders.counter[value.name || ``].base ++

  return createElement(
    Context, {value},
    createElement(Label),
    createElement(Button),
  )
}

const AppButton = () => {
  renders.app.button ++

  return createElement(`button`, {
    id: `appButton`,
    onClick: useAppState.increment,
    children: `App button`,
  })
}

const App = () => {
  const {count} = useAppState()
  renders.app.base ++
  renders.app.count = count

  return createElement(`section`, null,
    createElement(Counter, {name: `first`}),
    createElement(Counter, {name: `second`, count}),
    createElement(AppButton),
  )
}

let root: Root
let container: HTMLElement

beforeEach(() => {
  container = document.createElement(`main`)
  root = createRoot(container)
  document.body.appendChild(container)
  act(() => root.render(createElement(App)))
})

afterEach(() =>
  act(() => {
    root.unmount()
    reset(renders)
  })
)

describe(`🗃️ Context state`, () => {
  it(`should render context without props`, () => {
    act(() => root.render(createElement(Context)))
  })

  it(`should render once every component`, () => {
    expect(renders).toEqual({
      app: {count: 0, base: 1, button: 1},
      counter: {
        first: {count: 0, base: 1, label: 1, button: 1},
        second: {count: 0, base: 1, label: 1, button: 1},
      }
    })
  })

  it(`should increment first counter value and rerender it`, () => {
    const button = document.getElementById(`firstButton`)!

    act(() => fireEvent.click(button))
    expect(renders).toEqual({
      app: {count: 0, base: 1, button: 1},
      counter: {
        first: {count: 1, base: 1, label: 2, button: 1},
        second: {count: 0, base: 1, label: 1, button: 1},
      }
    })
  })

  it(`should increment second counter value and rerender it`, () => {
    const button = document.getElementById(`secondButton`)!

    act(() => fireEvent.click(button))
    expect(renders).toEqual({
      app: {count: 0, base: 1, button: 1},
      counter: {
        first: {count: 0, base: 1, label: 1, button: 1},
        second: {count: 1, base: 1, label: 2, button: 1},
      }
    })
  })

  it(`should increment counter value twice with single render`, () => {
    const button = document.getElementById(`firstButton`)!

    act(() => {
      // Two clicks are combined into a single batched render.
      fireEvent.click(button)
      fireEvent.click(button)
    })
    expect(renders).toEqual({
      app: {count: 0, base: 1, button: 1},
      counter: { // 👇🏻 value updated two times, but rendered once
        first: {count: 2, base: 1, label: 2, button: 1},
        second: {count: 0, base: 1, label: 1, button: 1},
      }
    })
  })

  /**
   * The app state updates will trigger a rerender of all components.
   * The context components are memoized and skip rerendering.
   * The second counter label is updated because it depends on context value.
   */
  it(`should rerender all components except context children`, () => {
    const button = document.getElementById(`appButton`)!

    act(() => fireEvent.click(button))
    expect(renders).toEqual({
      app: {count: 1, base: 2, button: 2},
      counter: {
        first: {count: 0, base: 2, label: 1, button: 1},
        second: {count: 1, base: 2, label: 2, button: 1},
      }
    })
  })

  /**
   * For more details check the `useEffect` in createContextState.
   */
  it(`should not call functions of context value`, () => {
    const onClick = jest.fn()
    const Component = createElement(Context, {
      value: {
        count: 1,
        onClick,
      }
    })

    act(() => root.render(Component))
    expect(onClick).not.toHaveBeenCalled()
  })

  it(`should throw exception on wrong value type`, () => {
    const {mockRestore} = jest.spyOn(console, `error`).mockImplementation(jest.fn)
    const MustFail = createElement(Context, {value: 1})

    expect(() => act(() => root.render(MustFail))).toThrow()
    mockRestore()
  })
})
