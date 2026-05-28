import { describe, it, expect } from 'vitest'
import { getFee } from './fees'
import type { FeeMap } from './fees'

describe('getFee', () => {
  const fees: FeeMap = {
    EUR: { GBP: 0.02, USD: 0.03 },
    GBP: { EUR: 0.05 },
  }

  it('returns the configured fee for a pair', () => {
    expect(getFee(fees, 'EUR', 'GBP')).toBe(0.02)
  })

  it('returns 0.01 default when pair is not configured', () => {
    expect(getFee(fees, 'EUR', 'JPY')).toBe(0.01)
  })

  it('returns 0.01 default when from key is missing', () => {
    expect(getFee(fees, 'JPY', 'USD')).toBe(0.01)
  })

  it('treats directions independently: EUR→GBP ≠ GBP→EUR', () => {
    expect(getFee(fees, 'EUR', 'GBP')).toBe(0.02)
    expect(getFee(fees, 'GBP', 'EUR')).toBe(0.05)
    expect(getFee(fees, 'EUR', 'GBP')).not.toBe(getFee(fees, 'GBP', 'EUR'))
  })
})
