import {act} from 'react-dom/test-utils'
import {createState, computed, Computed} from '..'
import {renderHook} from '../test-utils'
import {useUser} from '../test-utils/users'

let execCount = 0

type CircleState = {
  radius: number
  area: Computed<CircleState, number>
}

const useCircle = createState<CircleState>({
  radius: 3,
  area: computed(({radius}) => {
    execCount ++
    return Math.round(Math.PI * radius ** 2)
  }),
})

afterEach(() => {
  execCount = 0
  useCircle.reset() // reset does not reset cache of computed values
})

describe(`🧮 Computed value`, () => {
  it(`should retrieve a computed value`, () => {
    expect(useCircle.area).toBe(28)
    expect(execCount).toBe(1)
  })

  it(`should use cache and avoid recomputing`, () => {
    useCircle.set(`radius`, 5)

    expect(execCount).toBe(0) // computing function is not called until it is used
    expect(useCircle.area).toBe(79) // function is called, because the input is changed
    expect(useCircle.area).toBe(79) // no call, the value is retrieved from the cache
    expect(execCount).toBe(1)
  })
})

describe(`🧮 Computed value using hook`, () => {
  it(`should use cache if input is equal to previous one`, () => {
    const {result, renderCount} = renderHook(useUser)

    expect(renderCount()).toBe(1)
    expect(result.shortAddress).toBe(`742 Evergreen Terrace`)

    act(() => result.set(`address.building`, 742)) // same value
    act(() => result.set(`address.country`, `UK`)) // value is not used in computing function
    expect(renderCount()).toBe(1) // no re-render, because changes do not affect the computed value
  })

  it(`should not render after unmount`, () => {
    const {result, renderCount, unmount} = renderHook(useUser)
    expect(renderCount()).toBe(1)

    unmount()
    act(() => result.set(`address.building`, 21))
    expect(renderCount()).toBe(1)
  })

  it(`should call side effects only if computing function called as a hook`, () => {
    const useCrazy = createState<CircleState>({
      radius: 2,
      area: computed(({radius}, sideEffect) => {
        execCount ++
        const x = sideEffect(() => useCircle(`area`)) || 0
        const y = sideEffect(() => 10) || 0
        return x + y + radius
      }),
    })

    expect(useCrazy.area).toBe(2)

    const {result} = renderHook(useCrazy)
    expect(result.area).toBe(40)
    expect(useCircle.area).toBe(28)

    act(() => useCircle.set(`radius`, 5))
    expect(result.area).toBe(91)
    expect(useCrazy.area).toBe(91)
  })
})
