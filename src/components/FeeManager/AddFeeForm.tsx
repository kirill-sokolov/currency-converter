import { useEffect, useState, type FormEvent } from 'react'
import { Box, Button, Flex, Select, Text, TextField } from '@radix-ui/themes'
import { formatCurrencyOption } from '../../constants/currencies'
import { useFeeStore } from '../../store/feeStore'
import type { EditTarget } from './index'

interface AddFeeFormProps {
  rates: Record<string, number> | null
  ratesLoading: boolean
  ratesError: string | null
  retryRates: () => void
  editTarget: EditTarget | null
  onEditDone: () => void
}

export function AddFeeForm({
  rates,
  ratesLoading,
  ratesError,
  retryRates,
  editTarget,
  onEditDone,
}: AddFeeFormProps) {
  const setFee = useFeeStore((state) => state.setFee)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [feeInput, setFeeInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isEditing = editTarget !== null

  useEffect(() => {
    if (editTarget) {
      setFrom(editTarget.from)
      setTo(editTarget.to)
      setFeeInput(String(editTarget.fee))
      setError(null)
    }
  }, [editTarget])

  const currencies = rates ? Object.keys(rates).sort() : []
  const fromCurrencies = currencies.filter((currency) => currency !== to)
  const toCurrencies = currencies.filter((currency) => currency !== from)
  const selectDisabled = ratesLoading || !!ratesError || isEditing
  const submitDisabled = ratesLoading || !!ratesError

  const reset = () => {
    setFrom('')
    setTo('')
    setFeeInput('')
    setError(null)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!from || !to) {
      setError('Please select both currencies.')
      return
    }

    const fee = parseFloat(feeInput)
    if (isNaN(fee) || fee < 0 || fee >= 1) {
      setError('Fee must be a number ≥ 0 and < 1 (e.g. 0.05 for 5%).')
      return
    }

    setFee(from, to, fee)
    reset()
    if (isEditing) onEditDone()
  }

  const handleCancel = () => {
    reset()
    onEditDone()
  }

  const triggerPlaceholder = ratesLoading ? 'Loading…' : ratesError ? 'Unavailable' : 'Select…'

  return (
    <Box mt="5">
      <Text size="3" weight="bold" as="p" mb="3">
        {isEditing ? 'Edit Fee' : 'Add Fee'}
      </Text>

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
            <Select.Root value={from} onValueChange={setFrom} disabled={selectDisabled}>
              <Select.Trigger placeholder={triggerPlaceholder} />
              <Select.Content>
                {fromCurrencies.map((code) => (
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
            <Select.Root value={to} onValueChange={setTo} disabled={selectDisabled}>
              <Select.Trigger placeholder={triggerPlaceholder} />
              <Select.Content>
                {toCurrencies.map((code) => (
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
              disabled={submitDisabled}
              style={{ width: 140 }}
            />
          </Box>

          <Button type="submit" disabled={submitDisabled}>
            {isEditing ? 'Save' : 'Add'}
          </Button>

          {isEditing && (
            <Button type="button" variant="soft" color="gray" onClick={handleCancel}>
              Cancel
            </Button>
          )}
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
