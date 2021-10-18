import { useFormatFullDateAuto } from './ui-helpers'
import { renderHook, act } from '@testing-library/react-hooks'

describe("useFormatFullDateAuto", () => {
  const setup = () => {
    const { result: { current: formatFullDateAuto } } = renderHook(() => useFormatFullDateAuto())
    return { formatFullDateAuto } 
  }

  it('should work with normal dates', () => {
    const { formatFullDateAuto } = setup()
    expect(formatFullDateAuto('2021-05-02T19:43')).toEqual('02.05.2021 19:43')
  })

  it('should work with null dates', () => {
    const { formatFullDateAuto } = setup()
    expect(formatFullDateAuto(null)).toEqual('-')
  })
})
