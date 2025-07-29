'use client'

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
  Video,
} from 'lucide-react'
import { MENUS_DASHBOARD } from '@/lib/constants'
import { useGlobalStore } from '@/lib/stores/globalStore'

const icons = {
  LayoutDashboard,
  Users,
  User,
  House,
  ShieldUser,
  Volleyball,
  FileText,
  Video,
}

const Sidebar = () => {
  const { isActive: streamActive, matchTitle } = useGlobalStore()

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

      {/* Indicador de stream activo */}
      <div className='mt-auto border-t border-gray-700 pt-4'>
        <div className='flex items-center gap-2 px-3 py-2 text-sm'>
          <Video className='w-4 h-4' />
          <span className={streamActive ? 'text-green-400' : 'text-gray-300'}>
            Stream: {streamActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        {streamActive && matchTitle && (
          <div className='text-xs text-gray-400 px-3 mb-2'>{matchTitle}</div>
        )}
        <div className='text-xs text-gray-500 px-3'>
          {streamActive
            ? 'Navigate freely within admin area'
            : 'Start a stream to enable navigation'}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
