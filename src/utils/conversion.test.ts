import { describe, it, expect } from 'vitest'
import { calculateConversion } from './conversion'

describe('calculateConversion', () => {
  it('standard case', () => {
    const result = calculateConversion({ amount: 100, fee: 0.05, rate: 0.85 })
    expect(result.originalAmount).toBe(100)
    expect(result.fee).toBe(0.05)
    expect(result.feeAmount).toBeCloseTo(5)
    expect(result.amountAfterFee).toBeCloseTo(95)
    expect(result.rate).toBe(0.85)
    expect(result.result).toBeCloseTo(80.75)
  })

  it('default fee (0.01)', () => {
    const result = calculateConversion({ amount: 200, fee: 0.01, rate: 1.1 })
    expect(result.feeAmount).toBeCloseTo(2)
    expect(result.amountAfterFee).toBeCloseTo(198)
    expect(result.result).toBeCloseTo(217.8)
  })

  it('fee = 0 applies no deduction', () => {
    const result = calculateConversion({ amount: 50, fee: 0, rate: 2 })
    expect(result.feeAmount).toBe(0)
    expect(result.amountAfterFee).toBe(50)
    expect(result.result).toBe(100)
  })

  it('avoids floating-point accumulation in intermediate values', () => {
    // 100 * 0.1 = 9.999999999999998 in raw JS — should be exactly 10
    const result = calculateConversion({ amount: 100, fee: 0.1, rate: 1 })
    expect(result.feeAmount).toBe(10)
    expect(result.amountAfterFee).toBe(90)
    expect(result.result).toBe(90)
  })
})
