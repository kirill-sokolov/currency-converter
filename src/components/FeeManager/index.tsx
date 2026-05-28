interface FeeManagerProps {
  rates: Record<string, number> | null
  ratesLoading: boolean
  ratesError: string | null
  retryRates: () => void
}

export function FeeManager({ ratesLoading, ratesError, retryRates }: FeeManagerProps) {
  return (
    <div>
      <h2>Fee Manager</h2>
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
