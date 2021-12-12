import {renderHook} from '@testing-library/react-hooks'

export const renderHookWithCount = hook => {
  let count = 0
  const renderCount = () => count
  const result = renderHook(() => {
    count ++
    return hook()
  })
  return {renderCount, ...result}
}
