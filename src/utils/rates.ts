export function deriveRate(rates: Record<string, number>, from: string, to: string): number {
  if (!(from in rates)) throw new Error(`Unknown currency: ${from}`)
  if (!(to in rates)) throw new Error(`Unknown currency: ${to}`)

  if (from === 'EUR') return rates[to]!
  if (to === 'EUR') return 1 / rates[from]!
  return (1 / rates[from]!) * rates[to]!
}
