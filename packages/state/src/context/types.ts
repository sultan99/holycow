import type {ReactNode} from 'react'

export type ProviderProps<T> = {
  value?: T | {}
  children?: ReactNode | ReactNode[]
}
