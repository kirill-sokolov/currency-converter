import { Box, Separator, Text } from '@radix-ui/themes'
import { getSymbol } from '../../constants/currencies'
import type { ConversionBreakdown } from '../../utils/conversion'

interface ConversionResultProps {
  breakdown: ConversionBreakdown
  from: string
  to: string
}

function fmtAmount(n: number): string {
  return parseFloat(n.toFixed(6)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

function fmtRate(rate: number): string {
  return parseFloat(rate.toFixed(6)).toString()
}

function fmtPct(fee: number): string {
  return `${parseFloat((fee * 100).toFixed(4))}%`
}

export function ConversionResult({ breakdown, from, to }: ConversionResultProps) {
  const { originalAmount, fee, feeAmount, amountAfterFee, rate, result } = breakdown
  const fromSymbol = getSymbol(from)
  const toSymbol = getSymbol(to)

  return (
    <Box mt="4" p="3" style={{ background: 'var(--gray-2)', borderRadius: 'var(--radius-3)' }}>
      <Text size="4" weight="bold" as="p" mb="2">
        {fmtAmount(originalAmount)} {fromSymbol} {from} → {fmtAmount(result)} {toSymbol} {to}
      </Text>
      <Separator size="4" mb="2" />
      <Text as="p" size="2" color="gray">Fee: {fmtPct(fee)}</Text>
      <Text as="p" size="2" color="gray">
        Fee amount: {fmtAmount(feeAmount)} {fromSymbol} {from}
      </Text>
      <Text as="p" size="2" color="gray">
        After fee: {fmtAmount(amountAfterFee)} {fromSymbol} {from}
      </Text>
      <Text as="p" size="2" color="gray">
        Exchange rate: 1 {from} = {fmtRate(rate)} {to}
      </Text>
    </Box>
  )
}
