import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FeeMap } from '../utils/fees'

interface FeeStore {
  fees: FeeMap
  setFee: (from: string, to: string, fee: number) => void
  removeFee: (from: string, to: string) => void
}

export const useFeeStore = create<FeeStore>()(
  persist(
    (set) => ({
      fees: {},
      setFee: (from, to, fee) =>
        set((state) => ({
          fees: {
            ...state.fees,
            [from]: { ...state.fees[from], [to]: fee },
          },
        })),
      removeFee: (from, to) =>
        set((state) => {
          const fromFees = { ...state.fees[from] }
          delete fromFees[to]
          return { fees: { ...state.fees, [from]: fromFees } }
        }),
    }),
    { name: 'currency-fees' },
  ),
)
