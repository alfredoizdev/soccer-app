import React from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer'

import OrganizationForm from '@/components/admin/OrganizationForm'
import { X } from 'lucide-react'

export default function CreateTeamDrawer({
  open,
  onOpenChange,
  onTeamCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTeamCreated: (team: { id: string; name: string; value: string }) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction='right'>
      <DrawerContent>
        <DrawerHeader className='flex items-center justify-between w-full'>
          <div className='flex items-center justify-between w-full'>
            <DrawerTitle>Add New Team</DrawerTitle>
            <DrawerClose>
              <X className='w-4 h-4' />
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className='p-4'>
          <OrganizationForm
            action='create'
            onSuccess={() => {
              onOpenChange(false)
              // Aquí deberías obtener el nuevo equipo creado y pasarlo a onTeamCreated
              if (onTeamCreated)
                onTeamCreated({ id: 'new', name: 'New Team', value: 'new' })
            }}
            redirectPath='/admin/matches/new'
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
