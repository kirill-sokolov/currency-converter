import { useState } from 'react'
import { Box, Button, Flex, Table, Text } from '@radix-ui/themes'
import { getSymbol } from '../../constants/currencies'
import { useFeeStore } from '../../store/feeStore'
import { AddFeeForm } from './AddFeeForm'
import styles from './FeeManager.module.css'

interface FeeManagerProps {
  rates: Record<string, number> | null
  ratesLoading: boolean
  ratesError: string | null
  retryRates: () => void
}

export interface EditTarget {
  from: string
  to: string
  fee: number
}

function formatFee(fee: number): string {
  return `${parseFloat((fee * 100).toFixed(6))}%`
}

function formatCurrency(code: string): string {
  return `${getSymbol(code)} ${code}`
}

export function FeeManager(props: FeeManagerProps) {
  const fees = useFeeStore((state) => state.fees)
  const removeFee = useFeeStore((state) => state.removeFee)
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null)

  const rows = Object.entries(fees).flatMap(([from, feesByDestination]) =>
    Object.entries(feesByDestination).map(([to, fee]) => ({ from, to, fee })),
  )

  return (
    <Box p="4">
      <Text size="5" weight="bold" as="p" mb="4">Fee Manager</Text>

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
                  <Flex gap="2">
                    <Button
                      variant="soft"
                      size="1"
                      onClick={() => setEditTarget({ from, to, fee })}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="soft"
                      color="red"
                      size="1"
                      onClick={() => removeFee(from, to)}
                    >
                      Delete
                    </Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      <Text as="p" size="1" color="gray" mt="3">
        Pairs without a configured fee use the default of 1% (0.01).
      </Text>

      <div className={styles.stickyForm}>
        <AddFeeForm {...props} editTarget={editTarget} onEditDone={() => setEditTarget(null)} />
      </div>
    </Box>
  )
}
