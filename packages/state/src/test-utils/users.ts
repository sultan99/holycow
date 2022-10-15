import {createState, computed, Computed} from '..'
import {renderHook} from '../test-utils'

export type UserState = {
  id: number
  name: string
  surname: string
  age: number
  fullName: Computed<UserState, string>
  shortAddress: Computed<UserState, string>
  address: {
    building: number
    street: string
    city: string
    country: string
  }
}

export const userState: UserState = {
  id: 1,
  name: `Homer`,
  surname: `Simpson`,
  age: 68,
  fullName: computed(({name, surname}) =>
    `${name} ${surname}`
  ),
  shortAddress: computed(({address}) =>
    `${address.building} ${address.street}`
  ),
  address: {
    building: 742,
    street: `Evergreen Terrace`,
    city: `Springfield`,
    country: `USA`,
  },
}

export const useUser = createState(userState)

it(`🔥 Heating up tests`, () => {
  const {result} = renderHook(useUser)
  expect(result.id).toBe(1)
})
