export const USER_ROLES = [
  { value: 'user', label: 'Usuario' },
  { value: 'admin', label: 'Administrador' },
]

export const MENUS_DASHBOARD = [
  {
    value: 'home',
    label: 'Home',
    href: '/members/home',
    icon: 'House',
  },
  {
    value: 'dashboard',
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: 'LayoutDashboard',
  },
  { value: 'teams', label: 'Teams', href: '/admin/teams', icon: 'ShieldUser' },
  { value: 'users', label: 'Users', href: '/admin/users', icon: 'User' },
  { value: 'players', label: 'Players', href: '/admin/players', icon: 'Users' },
]
