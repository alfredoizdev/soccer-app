import { create } from 'zustand'
import { createUserSlice, UserSlice } from './slices/userSlice'
import { createPlayerSlice, PlayerSlice } from './slices/playerSlice'
import {
  createOrganizationSlice,
  OrganizationSlice,
} from './slices/organizationSlice'
import { createJerseySlice, JerseySlice } from './slices/jerseySlice'

// Combinar todos los slices en un solo tipo
type GlobalState = UserSlice &
  PlayerSlice &
  OrganizationSlice &
  JerseySlice & {
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
}))
