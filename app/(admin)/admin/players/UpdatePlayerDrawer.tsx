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
import PlayerForm, { PlayerFormInputs } from '@/components/admin/PlayerForm'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  player?: PlayerFormInputs & { id?: string }
  onSuccess?: () => void
}

export function UpdatePlayerDrawer({
  open,
  setOpen,
  player,
  onSuccess,
}: Props) {
  return (
    <Drawer open={open} onOpenChange={setOpen} direction='right'>
      <DrawerContent>
        <div className='mx-auto w-full max-w-sm'>
          <DrawerHeader>
            <DrawerTitle>Update Player</DrawerTitle>
            <DrawerDescription>Update the player details.</DrawerDescription>
          </DrawerHeader>
          <PlayerForm
            player={player}
            action='update'
            onSuccess={onSuccess || (() => setOpen(false))}
          />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
