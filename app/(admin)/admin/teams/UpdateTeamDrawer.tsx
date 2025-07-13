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
import { TeamType } from '@/types/TeamType'
import OrganizationForm from '@/components/admin/OrganizationForm'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  team: TeamType
}

export function UpdateTeamDrawer({ open, setOpen, team }: Props) {
  return (
    <Drawer open={open} onOpenChange={setOpen} direction='right'>
      <DrawerContent>
        <div className='mx-auto w-full max-w-sm'>
          <DrawerHeader>
            <DrawerTitle>Update Team</DrawerTitle>
            <DrawerDescription>Update the team details.</DrawerDescription>
          </DrawerHeader>
          <OrganizationForm
            team={team}
            onSuccess={() => setOpen(false)}
            action='update'
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
