import { ColumnDef } from '@tanstack/react-table'
import { PlayerType } from '@/types/PlayerType'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const columns: ColumnDef<
  PlayerType & { user?: { name: string; lastName: string } }
>[] = [
  {
    accessorKey: 'avatar',
    header: 'Avatar',
    cell: ({ row }) => (
      <Avatar>
        <AvatarImage src={row.original.avatar ?? ''} alt={row.original.name} />
        <AvatarFallback className='bg-gray-500 text-white'>
          {row.original.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
    ),
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
    accessorKey: 'age',
    header: 'Age',
  },
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) =>
      row.original.user
        ? `${row.original.user.name} ${row.original.user.lastName}`
        : '-',
  },
]
