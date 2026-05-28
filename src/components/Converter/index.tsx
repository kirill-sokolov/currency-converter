import { Box, Text } from '@radix-ui/themes'
import { ConverterForm } from './ConverterForm'

interface ConverterProps {
  rates: Record<string, number> | null
  ratesLoading: boolean
  ratesError: string | null
  retryRates: () => void
}

export function Converter(props: ConverterProps) {
  return (
    <Box p="4">
      <Text size="5" weight="bold" as="p" mb="4">Converter</Text>
      <ConverterForm {...props} />
    </Box>
  )
}
