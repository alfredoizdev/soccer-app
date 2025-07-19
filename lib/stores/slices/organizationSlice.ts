import { StateCreator } from 'zustand'
import { OrganizationType } from '@/types/UserType'

export interface OrganizationSlice {
  organizations: OrganizationType[]
  organizationsLoaded: boolean
  setOrganizations: (organizations: OrganizationType[]) => void
  loadOrganizations: () => Promise<void>
  getOrganizationById: (id: string) => OrganizationType | undefined
}

export const createOrganizationSlice: StateCreator<OrganizationSlice> = (
  set,
  get
) => ({
  organizations: [],
  organizationsLoaded: false,
  setOrganizations: (organizations) =>
    set({ organizations, organizationsLoaded: true }),
  loadOrganizations: async () => {
    if (get().organizationsLoaded) return

    try {
      const { getOrganizationsAction } = await import(
        '@/lib/actions/organization.action'
      )
      const result = await getOrganizationsAction()
      if (result.data) {
        set({ organizations: result.data, organizationsLoaded: true })
      }
    } catch (error) {
      console.error('Error loading organizations:', error)
    }
  },
  getOrganizationById: (id) => {
    const state = get()
    return state.organizations.find((org: OrganizationType) => org.id === id)
  },
})
