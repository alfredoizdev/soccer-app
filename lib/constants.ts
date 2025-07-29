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
  {
    value: 'teams',
    label: 'Teams',
    href: '/admin/teams',
    icon: 'ShieldUser',
  },
  {
    value: 'users',
    label: 'Users',
    href: '/admin/users?page=1&perPage=10',
    icon: 'User',
  },
  {
    value: 'players',
    label: 'Players',
    href: '/admin/players?page=1&perPage=10',
    icon: 'Users',
  },
  {
    value: 'matches',
    label: 'Matches',
    href: '/admin/matches',
    icon: 'Volleyball',
  },
  {
    value: 'match-history',
    label: 'Match History',
    href: '/admin/matches/history',
    icon: 'Volleyball',
  },
  {
    value: 'posts',
    label: 'Posts',
    href: '/admin/posts',
    icon: 'FileText',
  },
  {
    value: 'streams',
    label: 'Streams',
    href: '/admin/streams',
    icon: 'Video',
  },
]

export const RANGE_AGE = Array.from({ length: 41 }, (_, i) => i + 5)

export const SOCCER_POSITIONS = [
  { value: 'attack', label: 'Attack' },
  { value: 'midfield', label: 'Midfield' },
  { value: 'defence', label: 'Defence' },
  { value: 'goalkeeper', label: 'Goalkeeper' },
]
