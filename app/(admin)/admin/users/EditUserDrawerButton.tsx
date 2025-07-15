'use client'

import React from 'react'
import { PencilIcon } from 'lucide-react'
import { UpdateUserDrawer } from '@/app/(admin)/admin/users/UpdateUserDrawer'
import { UserFormInputs } from '@/components/admin/UserForm'

export default function EditUserDrawerButton({
  user,
}: {
  user: UserFormInputs & { id: string }
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <button
        className='absolute top-4 right-4 p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors shadow'
        onClick={() => setOpen(true)}
        aria-label='Edit Profile'
      >
        <PencilIcon className='w-5 h-5 text-blue-600' />
      </button>
      <UpdateUserDrawer open={open} setOpen={setOpen} user={user} />
    </>
  )
}
