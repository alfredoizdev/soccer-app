import React from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  User,
  House,
  ShieldUser,
  Volleyball,
  TestTube,
  FileText,
} from 'lucide-react'
import { MENUS_DASHBOARD } from '@/lib/constants'

const icons = {
  LayoutDashboard,
  Users,
  User,
  House,
  ShieldUser,
  Volleyball,
  FileText,
}

const Sidebar = () => {
  return (
    <aside className='hidden fixed top-10 left-0 md:flex h-full min-h-screen w-56 bg-gray-800 text-white flex-col py-9 px-4 gap-4'>
      {MENUS_DASHBOARD.map((menu) => {
        const Icon = icons[menu.icon as keyof typeof icons] || LayoutDashboard
        return (
          <Link
            key={menu.value}
            href={menu.href}
            className='hover:bg-gray-700 rounded px-3 py-2 flex items-center gap-2'
          >
            <Icon size={20} />
            <span>{menu.label}</span>
          </Link>
        )
      })}

      {/* Enlace de prueba automática */}
      <Link
        href='/admin/test-auto-match'
        className='hover:bg-gray-700 rounded px-3 py-2 flex items-center gap-2 mt-4 border-t border-gray-700 pt-4'
      >
        <TestTube size={20} />
        <span>Prueba Automática</span>
      </Link>
    </aside>
  )
}

export default Sidebar
