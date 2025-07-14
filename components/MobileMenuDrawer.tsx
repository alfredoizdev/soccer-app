import Link from 'next/link'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer'
import { Button } from './ui/button'
import React from 'react'
import { Menu, LayoutDashboard, Users, User, House } from 'lucide-react'

type Props = {
  open?: boolean
  setOpen?: (open: boolean) => void
  title: string
  menus: {
    label: string
    href: string
    icon: React.ReactNode
  }[]
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
          className='md:hidden mr-4 p-2 rounded hover:bg-gray-800 focus:outline-none'
          variant='ghost'
        >
          <Menu size={24} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className='bg-gray-900 text-white'>
        <DrawerHeader>
          <DrawerTitle className='text-2xl font-bold text-white'>
            {title}
          </DrawerTitle>
        </DrawerHeader>
        <div className='flex flex-col gap-2 items-start h-full p-4'>
          {menus.map((menu, index) => {
            const Icon =
              icons[menu.icon as keyof typeof icons] || LayoutDashboard
            return (
              <Link
                onClick={() => setOpen(false)}
                key={index}
                href={menu.href}
                className='hover:bg-gray-700 rounded px-3 py-2 flex items-center gap-2'
              >
                <Icon size={20} />
                <span>{menu.label}</span>
              </Link>
            )
          })}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
