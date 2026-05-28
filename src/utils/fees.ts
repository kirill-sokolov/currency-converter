export type FeeMap = Record<string, Record<string, number>>

export function getFee(fees: FeeMap, from: string, to: string): number {
  return fees[from]?.[to] ?? 0.01
}
