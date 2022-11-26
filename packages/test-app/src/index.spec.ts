import { sum } from './index'

describe('sum', () => {
  it('sums two numbers', () => {
    expect.assertions(1)
    expect(sum(2, 3)).toBe(5)
  })
})
