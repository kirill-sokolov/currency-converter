import { useState, useEffect, useCallback } from 'react'
import { Tabs } from '@radix-ui/themes'
import { fetchRates } from './services/ecbRates'
import { FeeManager } from './components/FeeManager'
import { Converter } from './components/Converter'

export default function App() {
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [ratesLoading, setRatesLoading] = useState(true)
  const [ratesError, setRatesError] = useState<string | null>(null)

  const retryRates = useCallback(async () => {
    setRatesLoading(true)
    setRatesError(null)
    try {
      setRates(await fetchRates())
    } catch (e) {
      setRatesError(e instanceof Error ? e.message : 'Failed to fetch rates')
    } finally {
      setRatesLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setRatesLoading(true)
    setRatesError(null)
    fetchRates()
      .then((data) => { if (!cancelled) setRates(data) })
      .catch((e) => { if (!cancelled) setRatesError(e instanceof Error ? e.message : 'Failed to fetch rates') })
      .finally(() => { if (!cancelled) setRatesLoading(false) })
    return () => { cancelled = true }
  }, [])

  const tabProps = { rates, ratesLoading, ratesError, retryRates }

  return (
    <Tabs.Root defaultValue="converter">
      <Tabs.List>
        <Tabs.Trigger value="converter">Converter</Tabs.Trigger>
        <Tabs.Trigger value="fees">Fee Manager</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="converter">
        <Converter {...tabProps} />
      </Tabs.Content>
      <Tabs.Content value="fees">
        <FeeManager {...tabProps} />
      </Tabs.Content>
    </Tabs.Root>
  )
}
