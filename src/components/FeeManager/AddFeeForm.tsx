import { useState } from 'react'
import { Box, Button, Flex, Select, Text, TextField } from '@radix-ui/themes'
import { formatCurrencyOption } from '../../constants/currencies'
import { useFeeStore } from '../../store/feeStore'

interface AddFeeFormProps {
  rates: Record<string, number> | null
  ratesLoading: boolean
  ratesError: string | null
  retryRates: () => void
}

export function AddFeeForm({ rates, ratesLoading, ratesError, retryRates }: AddFeeFormProps) {
  const setFee = useFeeStore((state) => state.setFee)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [feeInput, setFeeInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const currencies = rates ? Object.keys(rates).sort() : []
  const disabled = ratesLoading || !!ratesError

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!from || !to) {
      setError('Please select both currencies.')
      return
    }
    if (from === to) {
      setError('From and To currencies must be different.')
      return
    }

    const fee = parseFloat(feeInput)
    if (isNaN(fee) || fee < 0 || fee >= 1) {
      setError('Fee must be a number ≥ 0 and < 1 (e.g. 0.05 for 5%).')
      return
    }

    setFee(from, to, fee)
    setFrom('')
    setTo('')
    setFeeInput('')
  }

  const triggerPlaceholder = ratesLoading ? 'Loading…' : ratesError ? 'Unavailable' : 'Select…'

  return (
    <Box mt="5">
      <Text size="3" weight="bold" as="p" mb="3">Add Fee</Text>

      {ratesError && (
        <Flex align="center" gap="2" mb="3">
          <Text color="red" size="2">Failed to load rates: {ratesError}</Text>
          <Button variant="soft" size="1" onClick={retryRates}>Retry</Button>
        </Flex>
      )}

      <form onSubmit={handleSubmit}>
        <Flex gap="3" align="end" wrap="wrap">
          <Box>
            <Text as="label" size="1" color="gray" mb="1" style={{ display: 'block' }}>
              From
            </Text>
            <Select.Root value={from} onValueChange={setFrom} disabled={disabled}>
              <Select.Trigger placeholder={triggerPlaceholder} />
              <Select.Content>
                {currencies.map((code) => (
                  <Select.Item key={code} value={code}>
                    {formatCurrencyOption(code)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          <Box>
            <Text as="label" size="1" color="gray" mb="1" style={{ display: 'block' }}>
              To
            </Text>
            <Select.Root value={to} onValueChange={setTo} disabled={disabled}>
              <Select.Trigger placeholder={triggerPlaceholder} />
              <Select.Content>
                {currencies.map((code) => (
                  <Select.Item key={code} value={code}>
                    {formatCurrencyOption(code)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          <Box>
            <Text as="label" size="1" color="gray" mb="1" style={{ display: 'block' }}>
              Fee (e.g. 0.05 for 5%)
            </Text>
            <TextField.Root
              placeholder="0.01"
              value={feeInput}
              onChange={(e) => setFeeInput(e.target.value)}
              disabled={disabled}
              style={{ width: 140 }}
            />
          </Box>

          <Button type="submit" disabled={disabled}>
            Add
          </Button>
        </Flex>

        {error && (
          <Text color="red" size="2" as="p" mt="2">
            {error}
          </Text>
        )}
      </form>
    </Box>
  )
}
