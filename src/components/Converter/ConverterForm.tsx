import { useState } from 'react'
import { Box, Button, Flex, Select, Spinner, Text, TextField } from '@radix-ui/themes'
import { formatCurrencyOption } from '../../constants/currencies'
import { useFeeStore } from '../../store/feeStore'
import { calculateConversion, type ConversionBreakdown } from '../../utils/conversion'
import { getFee } from '../../utils/fees'
import { deriveRate } from '../../utils/rates'
import { ConversionResult } from './ConversionResult'

interface ConverterFormProps {
  rates: Record<string, number> | null
  ratesLoading: boolean
  ratesError: string | null
  retryRates: () => void
}

export function ConverterForm({ rates, ratesLoading, ratesError, retryRates }: ConverterFormProps) {
  const fees = useFeeStore((state) => state.fees)
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('USD')
  const [amountInput, setAmountInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [breakdown, setBreakdown] = useState<ConversionBreakdown | null>(null)

  const currencies = rates ? Object.keys(rates).sort() : []
  const fromCurrencies = currencies.filter((c) => c !== to)
  const toCurrencies = currencies.filter((c) => c !== from)
  const formDisabled = ratesLoading || !!ratesError

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBreakdown(null)

    const amount = parseFloat(amountInput)
    if (!amountInput.trim() || isNaN(amount)) {
      setError('Please enter a valid amount.')
      return
    }
    if (amount <= 0) {
      setError('Amount must be greater than 0.')
      return
    }
    if (!rates) return

    const rate = deriveRate(rates, from, to)
    const fee = getFee(fees, from, to)
    setBreakdown(calculateConversion({ amount, fee, rate }))
  }

  const triggerPlaceholder = ratesLoading ? 'Loading…' : ratesError ? 'Unavailable' : 'Select…'

  return (
    <Box>
      {ratesLoading && (
        <Flex align="center" gap="2" mb="3">
          <Spinner />
          <Text color="gray" size="2">Loading exchange rates…</Text>
        </Flex>
      )}

      {ratesError && (
        <Flex align="center" gap="2" mb="3">
          <Text color="red" size="2">Failed to load rates: {ratesError}</Text>
          <Button variant="soft" size="1" onClick={retryRates}>Retry</Button>
        </Flex>
      )}

      <form onSubmit={handleConvert}>
        <Flex gap="3" align="end" wrap="wrap">
          <Box>
            <Text as="label" size="1" color="gray" mb="1" style={{ display: 'block' }}>
              Amount
            </Text>
            <TextField.Root
              placeholder="100"
              value={amountInput}
              onChange={(e) => {
                const v = e.target.value
                if (v === '' || /^\d*\.?\d*$/.test(v)) {
                  setAmountInput(v)
                  setBreakdown(null)
                }
              }}
              disabled={formDisabled}
              style={{ width: 120 }}
            />
          </Box>

          <Box>
            <Text as="label" size="1" color="gray" mb="1" style={{ display: 'block' }}>
              From
            </Text>
            <Select.Root
              value={from}
              onValueChange={(v) => { setFrom(v); setBreakdown(null) }}
              disabled={formDisabled}
            >
              <Select.Trigger placeholder={triggerPlaceholder} />
              <Select.Content>
                {fromCurrencies.map((code) => (
                  <Select.Item key={code} value={code}>{formatCurrencyOption(code)}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          <Box>
            <Text as="label" size="1" color="gray" mb="1" style={{ display: 'block' }}>
              To
            </Text>
            <Select.Root
              value={to}
              onValueChange={(v) => { setTo(v); setBreakdown(null) }}
              disabled={formDisabled}
            >
              <Select.Trigger placeholder={triggerPlaceholder} />
              <Select.Content>
                {toCurrencies.map((code) => (
                  <Select.Item key={code} value={code}>{formatCurrencyOption(code)}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          <Button type="submit" disabled={formDisabled}>
            {ratesLoading ? <Spinner /> : 'Convert'}
          </Button>
        </Flex>

        {error && (
          <Text color="red" size="2" as="p" mt="2">{error}</Text>
        )}
      </form>

      {breakdown && <ConversionResult breakdown={breakdown} from={from} to={to} />}
    </Box>
  )
}
