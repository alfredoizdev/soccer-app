export type UserType = {
  id: string
  name: string
  lastName: string
  email: string
  password: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
  age: number
}
