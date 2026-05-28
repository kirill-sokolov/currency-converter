import { Box, Button, Table, Text } from '@radix-ui/themes'
import { getSymbol } from '../../constants/currencies'
import { useFeeStore } from '../../store/feeStore'

interface FeeManagerProps {
  rates: Record<string, number> | null
  ratesLoading: boolean
  ratesError: string | null
  retryRates: () => void
}

function formatFee(fee: number): string {
  return `${parseFloat((fee * 100).toFixed(6))}%`
}

function formatCurrency(code: string): string {
  return `${getSymbol(code)} ${code}`
}

export function FeeManager({ ratesLoading, ratesError, retryRates }: FeeManagerProps) {
  const fees = useFeeStore((state) => state.fees)
  const removeFee = useFeeStore((state) => state.removeFee)

  const rows = Object.entries(fees).flatMap(([from, toMap]) =>
    Object.entries(toMap).map(([to, fee]) => ({ from, to, fee })),
  )

  return (
    <Box p="4">
      <Text size="5" weight="bold" as="p" mb="4">Fee Manager</Text>

      {ratesLoading && <Text color="gray">Loading rates…</Text>}
      {ratesError && (
        <Box mb="3">
          <Text color="red">Error: {ratesError}</Text>
          <Button variant="soft" ml="3" onClick={retryRates}>Retry</Button>
        </Box>
      )}

      {rows.length === 0 ? (
        <Text color="gray">No fees configured.</Text>
      ) : (
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>From</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>To</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Fee (%)</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map(({ from, to, fee }) => (
              <Table.Row key={`${from}-${to}`}>
                <Table.Cell>{formatCurrency(from)}</Table.Cell>
                <Table.Cell>{formatCurrency(to)}</Table.Cell>
                <Table.Cell>{formatFee(fee)}</Table.Cell>
                <Table.Cell>
                  <Button
                    variant="soft"
                    color="red"
                    size="1"
                    onClick={() => removeFee(from, to)}
                  >
                    Delete
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Box>
  )
}
