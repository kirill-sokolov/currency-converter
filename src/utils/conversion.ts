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

export function calculateConversion(input: ConversionInput): ConversionBreakdown {
  const { amount, fee, rate } = input
  const feeAmount = amount * fee
  const amountAfterFee = amount - feeAmount
  const result = amountAfterFee * rate
  return { originalAmount: amount, fee, feeAmount, amountAfterFee, rate, result }
}
