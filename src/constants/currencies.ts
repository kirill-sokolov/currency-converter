export const currencyMeta: Record<string, { symbol: string; name: string }> = {
  EUR: { symbol: '€', name: 'Euro' },
  USD: { symbol: '$', name: 'US Dollar' },
  GBP: { symbol: '£', name: 'British Pound' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  CHF: { symbol: 'Fr', name: 'Swiss Franc' },
  SEK: { symbol: 'kr', name: 'Swedish Krona' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone' },
  DKK: { symbol: 'kr', name: 'Danish Krone' },
  PLN: { symbol: 'zł', name: 'Polish Zloty' },
  CZK: { symbol: 'Kč', name: 'Czech Koruna' },
}

export function getSymbol(code: string): string {
  return currencyMeta[code]?.symbol ?? code
}

export function getName(code: string): string {
  return currencyMeta[code]?.name ?? code
}

export function formatCurrencyOption(code: string): string {
  const meta = currencyMeta[code]
  return meta ? `${meta.symbol} ${meta.name}` : code
}
