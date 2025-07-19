import { StateCreator } from 'zustand'
import { PlayerType } from '@/types/PlayerType'

export interface PlayerSlice {
  players: PlayerType[]
  playersLoaded: boolean
  setPlayers: (players: PlayerType[]) => void
  loadPlayers: () => Promise<void>
}

export const createPlayerSlice: StateCreator<PlayerSlice> = (set, get) => ({
  players: [],
  playersLoaded: false,
  setPlayers: (players) => set({ players, playersLoaded: true }),
  loadPlayers: async () => {
    if (get().playersLoaded) return

    try {
      const { getPlayersAction } = await import('@/lib/actions/player.action')
      const result = await getPlayersAction()
      if (result.data) {
        set({ players: result.data, playersLoaded: true })
      }
    } catch (error) {
      console.error('Error loading players:', error)
    }
  },
})
