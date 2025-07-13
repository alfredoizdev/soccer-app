'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { OrganizationType } from '@/types/UserType'
import { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<OrganizationType>[] = [
  {
    accessorKey: 'avatar',
    header: 'Avatar',
    cell: ({ row }) => {
      return (
        <Avatar>
          {row.original.avatar ? (
            <AvatarImage
              src={row.original.avatar}
              width={100}
              height={100}
              alt={row.original.name}
              className='w-full h-full object-cover'
            />
          ) : null}
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
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      return (
        <div className='text-sm text-gray-500'>
          {row.original.description.slice(0, 20)}...
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) =>
      row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleDateString()
        : '',
  },
]
