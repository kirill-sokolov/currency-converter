import { Box, Separator, Text } from '@radix-ui/themes'
import { getSymbol } from '../../constants/currencies'
import type { ConversionBreakdown } from '../../utils/conversion'

interface ConversionResultProps {
  breakdown: ConversionBreakdown
  from: string
  to: string
}

function formatAmount(amount: number): string {
  return parseFloat(amount.toFixed(6)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

function formatRate(rate: number): string {
  return parseFloat(rate.toFixed(6)).toString()
}

function formatPercentage(fee: number): string {
  return `${parseFloat((fee * 100).toFixed(4))}%`
}

export function ConversionResult({ breakdown, from, to }: ConversionResultProps) {
  const { originalAmount, fee, feeAmount, amountAfterFee, rate, result } = breakdown
  const fromSymbol = getSymbol(from)
  const toSymbol = getSymbol(to)

  return (
    <Box mt="4" p="3" style={{ background: 'var(--gray-2)', borderRadius: 'var(--radius-3)' }}>
      <Text size="4" weight="bold" as="p" mb="2">
        {formatAmount(originalAmount)} {fromSymbol} {from} → {formatAmount(result)} {toSymbol} {to}
      </Text>
      <Separator size="4" mb="2" />
      <Text as="p" size="2" color="gray">Fee: {formatPercentage(fee)}</Text>
      <Text as="p" size="2" color="gray">
        Fee amount: {formatAmount(feeAmount)} {fromSymbol} {from}
      </Text>
      <Text as="p" size="2" color="gray">
        After fee: {formatAmount(amountAfterFee)} {fromSymbol} {from}
      </Text>
      <Text as="p" size="2" color="gray">
        Exchange rate: 1 {from} = {formatRate(rate)} {to}
      </Text>
    </Box>
  )
}
