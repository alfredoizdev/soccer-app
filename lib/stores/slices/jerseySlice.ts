import { StateCreator } from 'zustand'

export interface JerseySlice {
  jerseyAvailability: Record<string, boolean> // key: "orgId-number"
  setJerseyAvailability: (
    orgId: string,
    number: number,
    available: boolean
  ) => void
  getJerseyAvailability: (orgId: string, number: number) => boolean | undefined
}

export const createJerseySlice: StateCreator<JerseySlice> = (set, get) => ({
  jerseyAvailability: {},
  setJerseyAvailability: (orgId, number, available) => {
    const key = `${orgId}-${number}`
    set((state) => ({
      jerseyAvailability: {
        ...state.jerseyAvailability,
        [key]: available,
      },
    }))
  },
  getJerseyAvailability: (orgId, number) => {
    const key = `${orgId}-${number}`
    return get().jerseyAvailability[key]
  },
})
