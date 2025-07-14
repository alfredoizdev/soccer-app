import { ColumnDef } from '@tanstack/react-table'
import { PlayerType } from '@/types/PlayerType'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { removePlayerFromOrganizationAction } from '@/lib/actions/player.action'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

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
    header: 'Parent',
    cell: ({ row }) =>
      row.original.user
        ? `${row.original.user.name} ${row.original.user.lastName}`
        : '-',
  },
  {
    accessorKey: 'totalGoals',
    header: 'Goals',
  },
  {
    accessorKey: 'totalAssists',
    header: 'Assists',
  },
  {
    accessorKey: 'totalPassesCompleted',
    header: 'Passes Completed',
  },
  {
    accessorKey: 'totalDuelsWon',
    header: 'Duels Won',
  },
  {
    accessorKey: 'totalDuelsLost',
    header: 'Duels Lost',
  },
  {
    id: 'actions',
    header: 'Acción',
    cell: ({ row }) => (
      <Button
        variant='ghost'
        className='bg-destructive/20 text-destructive p-0 hover:bg-destructive/30'
        size='sm'
        onClick={async (e) => {
          e.stopPropagation()
          const res = await removePlayerFromOrganizationAction(
            row.original.id,
            row.original.organizationId as string
          )
          if (res.success) {
            toast.success('Player removed from team')
            // Opcional: refrescar la tabla si se pasa un callback
          } else {
            toast.error(res.error || 'Error removing player')
          }
        }}
      >
        <Trash2 className='w-4 h-4' />
      </Button>
    ),
  },
]
