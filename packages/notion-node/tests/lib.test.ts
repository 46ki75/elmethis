import { divide } from '../src/lib.js'
import { expect, test } from 'vitest'

test('divide', () => {
  expect(divide(4, 2)).toBe(2)
})
