interface ConverterProps {
  rates: Record<string, number> | null
  ratesLoading: boolean
  ratesError: string | null
  retryRates: () => void
}

export function Converter({ ratesLoading, ratesError, retryRates }: ConverterProps) {
  return (
    <div>
      <h2>Converter</h2>
      {ratesLoading && <p>Loading rates…</p>}
      {ratesError && (
        <div>
          <p>Error: {ratesError}</p>
          <button onClick={retryRates}>Retry</button>
        </div>
      )}
    </div>
  )
}
