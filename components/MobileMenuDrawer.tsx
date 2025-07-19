import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Menu, LayoutDashboard, Users, User, House } from 'lucide-react'
import Link from 'next/link'

interface MenuItem {
  label: string
  href: string
  icon: string
  value: string
}

interface Props {
  open?: boolean
  setOpen?: (open: boolean) => void
  title: string
  menus: MenuItem[]
}

export default function MobileMenuDrawer({
  open: controlledOpen,
  setOpen: controlledSetOpen,
  title,
  menus,
}: Props) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled =
    controlledOpen !== undefined && controlledSetOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledSetOpen : setInternalOpen

  const icons = {
    LayoutDashboard,
    Users,
    User,
    House,
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction='left'>
      <DrawerTrigger asChild>
        <Button
          className='2xl:hidden mr-2 sm:mr-4 p-1.5 sm:p-2 rounded hover:bg-gray-800 focus:outline-none'
          variant='ghost'
        >
          <Menu size={20} className='sm:w-6 sm:h-6' />
        </Button>
      </DrawerTrigger>
      <DrawerContent className='bg-gray-900 text-white'>
        <DrawerHeader>
          <DrawerTitle className='text-xl sm:text-2xl font-bold text-white'>
            {title}
          </DrawerTitle>
        </DrawerHeader>
        <div className='flex flex-col gap-2 items-start h-full p-3 sm:p-4'>
          {menus.map((menu, index) => {
            const Icon =
              icons[menu.icon as keyof typeof icons] || LayoutDashboard
            return (
              <Link
                onClick={() => setOpen(false)}
                key={index}
                href={menu.href}
                className='hover:bg-gray-700 rounded px-2 sm:px-3 py-2 flex items-center gap-2 w-full text-sm sm:text-base'
              >
                <Icon size={18} className='sm:w-5 sm:h-5' />
                <span className='truncate'>{menu.label}</span>
              </Link>
            )
          })}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
