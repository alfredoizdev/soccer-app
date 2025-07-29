import { create } from 'zustand'
import { createUserSlice, UserSlice } from './slices/userSlice'
import { createPlayerSlice, PlayerSlice } from './slices/playerSlice'
import {
  createOrganizationSlice,
  OrganizationSlice,
} from './slices/organizationSlice'
import { createJerseySlice, JerseySlice } from './slices/jerseySlice'

// Stream state type
interface StreamState {
  sessionId: string | null
  matchId: string | null
  matchTitle: string | null
  isActive: boolean
}

// Stream actions type
interface StreamActions {
  setActiveStream: (stream: {
    sessionId: string
    matchId: string
    matchTitle: string
  }) => void
  clearActiveStream: () => void
}

// Combinar todos los slices en un solo tipo
type GlobalState = UserSlice &
  PlayerSlice &
  OrganizationSlice &
  JerseySlice &
  StreamState &
  StreamActions & {
    clearAll: () => void
  }

export const useGlobalStore = create<GlobalState>((set, get, api) => ({
  // Combinar todos los slices
  ...createUserSlice(set, get, api),
  ...createPlayerSlice(set, get, api),
  ...createOrganizationSlice(set, get, api),
  ...createJerseySlice(set, get, api),

  // Función para limpiar todo el estado
  clearAll: () =>
    set({
      users: [],
      usersLoaded: false,
      players: [],
      playersLoaded: false,
      organizations: [],
      organizationsLoaded: false,
      jerseyAvailability: {},
    }),

  // Stream state
  sessionId: null,
  matchId: null,
  matchTitle: null,
  isActive: false,

  // Stream actions
  setActiveStream: (stream) =>
    set({
      sessionId: stream.sessionId,
      matchId: stream.matchId,
      matchTitle: stream.matchTitle,
      isActive: true,
    }),

  clearActiveStream: () =>
    set({
      sessionId: null,
      matchId: null,
      matchTitle: null,
      isActive: false,
    }),
}))
