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
  DrawerTrigger,
} from '@/components/ui/drawer'
import { TeamType } from '@/types/TeamType'
import OrganizationForm from '@/components/admin/OrganizationForm'
import { PencilIcon } from 'lucide-react'
import { useState } from 'react'

type Props = {
  team: TeamType
}

export function UpdateTeamDrawer({ team }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen} direction='right'>
      <DrawerTrigger asChild>
        <Button variant='outline' size='icon' className='rounded-none'>
          <PencilIcon className='w-4 h-4' />
        </Button>
      </DrawerTrigger>
      <DrawerContent className='rounded-none'>
        <div className='mx-auto w-full max-w-sm'>
          <DrawerHeader>
            <DrawerTitle>Update Team</DrawerTitle>
            <DrawerDescription>Update the team details.</DrawerDescription>
          </DrawerHeader>
          <OrganizationForm
            team={team}
            onSuccess={() => setOpen?.(false)}
            action='update'
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
