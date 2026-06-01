const FETCH_TIMEOUT_MS = 10 * 1000

export class RateFetchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RateFetchError'
  }
}

export async function fetchRates(): Promise<Record<string, number>> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch('/ecb-rates', { signal: controller.signal })
  } catch (e) {
    throw new RateFetchError(e instanceof Error ? e.message : 'Network error')
  } finally {
    clearTimeout(timeoutId)
  }

  if (!res.ok) {
    throw new RateFetchError(`HTTP ${res.status}`)
  }

  const xml = await res.text()
  const doc = new DOMParser().parseFromString(xml, 'application/xml')

  if (doc.querySelector('parsererror')) {
    throw new RateFetchError('Failed to parse ECB XML response')
  }

  const rates: Record<string, number> = { EUR: 1 }
  doc.querySelectorAll('Cube[currency]').forEach((node) => {
    const currency = node.getAttribute('currency')
    const rate = node.getAttribute('rate')
    if (currency && rate) rates[currency] = parseFloat(rate)
  })

  if (Object.keys(rates).length <= 1) {
    throw new RateFetchError('No rates found in ECB response')
  }

  return rates
}
