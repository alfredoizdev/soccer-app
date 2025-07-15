export type UserType = {
  id: string
  name: string
  lastName: string
  email: string
  password: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
  avatar?: string | null
  organizationId?: string
}

export type OrganizationType = {
  id: string
  name: string
  description: string
  avatar: string
  createdAt?: Date | string
}
