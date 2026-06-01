const ROUNDING_PRECISION = 10

export interface ConversionInput {
  amount: number
  fee: number
  rate: number
}

export interface ConversionBreakdown {
  originalAmount: number
  fee: number
  feeAmount: number
  amountAfterFee: number
  rate: number
  result: number
}

function roundToPrecision(value: number, decimals = ROUNDING_PRECISION): number {
  return parseFloat(value.toFixed(decimals))
}

export function calculateConversion(input: ConversionInput): ConversionBreakdown {
  const { amount, fee, rate } = input
  const feeAmount = roundToPrecision(amount * fee)
  const amountAfterFee = roundToPrecision(amount - feeAmount)
  const result = roundToPrecision(amountAfterFee * rate)
  return { originalAmount: amount, fee, feeAmount, amountAfterFee, rate, result }
}
