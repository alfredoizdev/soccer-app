'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import PlayerFormAdmin, {
  PlayerFormAdminInputs,
} from '@/components/admin/PlayerFormAdmin'
import { useGlobalStore } from '@/lib/stores/globalStore'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  player?: PlayerFormAdminInputs & { id?: string }
  onSuccess?: () => void
}

export function UpdatePlayerDrawer({
  open,
  setOpen,
  player,
  onSuccess,
}: Props) {
  const { organizationsLoaded, loadOrganizations } = useGlobalStore()

  // Solo cargar organizaciones cuando el drawer está abierto
  React.useEffect(() => {
    if (open && !organizationsLoaded) {
      loadOrganizations()
    }
  }, [open, organizationsLoaded, loadOrganizations])

  // No renderizar nada si está cerrado
  if (!open) {
    return null
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction='right'>
      <DrawerContent className='rounded-none'>
        <div className='mx-auto w-full max-w-sm'>
          <DrawerHeader>
            <DrawerTitle>Update Player</DrawerTitle>
            <DrawerDescription>Update the player details.</DrawerDescription>
          </DrawerHeader>
          <PlayerFormAdmin
            player={player}
            action='update'
            onSuccess={onSuccess || (() => setOpen(false))}
          />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant='outline' className='rounded-none'>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
