import { useState, useEffect, useCallback } from 'react'
import { Tabs } from '@radix-ui/themes'
import { FeeManager } from './components/FeeManager'
import { Converter } from './components/Converter'

function parseEcbXml(xml: string): Record<string, number> {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const rates: Record<string, number> = { EUR: 1 }
  doc.querySelectorAll('Cube[currency]').forEach((node) => {
    const currency = node.getAttribute('currency')
    const rate = node.getAttribute('rate')
    if (currency && rate) rates[currency] = parseFloat(rate)
  })
  return rates
}

export default function App() {
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [ratesLoading, setRatesLoading] = useState(true)
  const [ratesError, setRatesError] = useState<string | null>(null)

  const fetchRates = useCallback(async () => {
    setRatesLoading(true)
    setRatesError(null)
    try {
      const res = await fetch('/ecb-rates')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const xml = await res.text()
      setRates(parseEcbXml(xml))
    } catch (e) {
      setRatesError(e instanceof Error ? e.message : 'Failed to fetch rates')
    } finally {
      setRatesLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchRates()
  }, [fetchRates])

  const tabProps = { rates, ratesLoading, ratesError, retryRates: fetchRates }

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
