'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { UserType } from '@/types/UserType'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil } from 'lucide-react'
import Link from 'next/link'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  email: string
}

export function getUserColumns(
  onEditUser?: (user: UserType) => void
): ColumnDef<UserType>[] {
  return [
    {
      accessorKey: 'avatar',
      header: 'Avatar',
      cell: ({ row }) => {
        return (
          <Avatar>
            <AvatarImage
              src={row.original.avatar || undefined}
              width={100}
              height={100}
              alt={row.original.name}
              className='w-full h-full object-cover'
            />
            <AvatarFallback className='bg-gray-500 text-md font-bold text-white'>
              {row.original.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const isActive = status === 'active'
        return (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold 
            ${
              isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        )
      },
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex gap-2 items-center'>
          <Button
            variant='ghost'
            size='sm'
            className='text-primary p-0'
            onClick={(e) => {
              e.stopPropagation()
              if (onEditUser) onEditUser(row.original)
            }}
            title='Edit User'
          >
            <Pencil className='w-4 h-4' />
          </Button>
          <Link
            href={`/admin/users/${row.original.id}`}
            className='flex items-center justify-center text-blue-600 hover:text-blue-800'
            title='View Profile'
            onClick={(e) => e.stopPropagation()}
            passHref
          >
            <Button variant='ghost' size='sm' className='text-primary p-0'>
              <Eye className='w-4 h-4' />
            </Button>
          </Link>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
