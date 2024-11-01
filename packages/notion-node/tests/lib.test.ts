import { divide } from '../src/lib'
import { expect, test } from 'vitest'

test('divide', () => {
  expect(divide(4, 2)).toBe(2)
})
