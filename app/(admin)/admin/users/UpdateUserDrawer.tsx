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
import UserForm, { UserFormInputs } from '@/components/admin/UserForm'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  user?: UserFormInputs & { id?: string }
  onSuccess?: () => void
}

export function UpdateUserDrawer({ open, setOpen, user, onSuccess }: Props) {
  return (
    <Drawer open={open} onOpenChange={setOpen} direction='right'>
      <DrawerContent className='rounded-none'>
        <div className='mx-auto w-full max-w-sm'>
          <DrawerHeader>
            <DrawerTitle>Update User</DrawerTitle>
            <DrawerDescription>Update the user details.</DrawerDescription>
          </DrawerHeader>
          <UserForm
            user={user}
            action='update'
            onSuccess={onSuccess || (() => setOpen(false))}
            redirectPath={undefined}
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
