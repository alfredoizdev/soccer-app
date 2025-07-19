import { StateCreator } from 'zustand'
import { UserType } from '@/types/UserType'

export interface UserSlice {
  users: UserType[]
  usersLoaded: boolean
  setUsers: (users: UserType[]) => void
  loadUsers: () => Promise<void>
}

export const createUserSlice: StateCreator<UserSlice> = (set, get) => ({
  users: [],
  usersLoaded: false,
  setUsers: (users) => set({ users, usersLoaded: true }),
  loadUsers: async () => {
    if (get().usersLoaded) return

    try {
      const { getUsersAction } = await import('@/lib/actions/users.action')
      const result = await getUsersAction()
      if (result.data) {
        // Normalizar organizationId: null a undefined para UserType
        const normalizedUsers = result.data.map((user) => ({
          ...user,
          organizationId: user.organizationId ?? undefined,
        }))
        set({ users: normalizedUsers, usersLoaded: true })
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  },
})
