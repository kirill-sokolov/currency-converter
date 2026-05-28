import { describe, it, expect } from 'vitest'
import { deriveRate } from './rates'

const rates = { EUR: 1, USD: 1.1, GBP: 0.85, JPY: 160 }

describe('deriveRate', () => {
  it('EUR → X returns rates[to]', () => {
    expect(deriveRate(rates, 'EUR', 'USD')).toBe(1.1)
    expect(deriveRate(rates, 'EUR', 'GBP')).toBe(0.85)
  })

  it('X → EUR returns 1 / rates[from]', () => {
    expect(deriveRate(rates, 'USD', 'EUR')).toBeCloseTo(1 / 1.1)
    expect(deriveRate(rates, 'GBP', 'EUR')).toBeCloseTo(1 / 0.85)
  })

  it('X → Y returns (1 / rates[from]) * rates[to]', () => {
    expect(deriveRate(rates, 'GBP', 'USD')).toBeCloseTo((1 / 0.85) * 1.1)
    expect(deriveRate(rates, 'USD', 'JPY')).toBeCloseTo((1 / 1.1) * 160)
  })

  it('throws if from currency is unknown', () => {
    expect(() => deriveRate(rates, 'XYZ', 'USD')).toThrow('Unknown currency: XYZ')
  })

  it('throws if to currency is unknown', () => {
    expect(() => deriveRate(rates, 'USD', 'XYZ')).toThrow('Unknown currency: XYZ')
  })
})
