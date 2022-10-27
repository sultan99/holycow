import {act} from 'react-dom/test-utils'
import {createState, computed, Computed} from '..'
import {renderHook} from '../test-utils'
import {useUser} from '../test-utils/users'

type CircleState = {
  radius: number
  area: Computed<CircleState, number>
}

type ConeState = {
  height: number
  volume: Computed<ConeState, number>
}

let execCount = 0

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
    expect(useCircle.area).toBe(79)
    expect(execCount).toBe(1) // computing function called once the other time used cache
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
    const useCone = createState<ConeState>({
      height: 2,
      volume: computed(({height}, sideEffect) => {
        execCount ++
        const whiteNoise = sideEffect(() => 1.5) || 0
        const area = sideEffect(() => useCircle(`area`)) || 0
        return Math.round(1 / 3 * area * height + whiteNoise)
      }),
    })

    expect(useCone.volume).toBe(0)

    const {result} = renderHook(useCone)
    expect(result.volume).toBe(20)

    act(() => useCircle.set(`radius`, 5))
    expect(result.volume).toBe(54)
    expect(useCone.volume).toBe(54)
    expect(execCount).toBe(4) // side effects prevent caching
  })
})
