import { ColumnDef } from '@tanstack/react-table'
import { PlayerType } from '@/types/PlayerType'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  removePlayerFromOrganizationAction,
  deletePlayerAction,
} from '@/lib/actions/player.action'
import { toast } from 'sonner'
import { Trash2, Eye, Pencil } from 'lucide-react'
import Link from 'next/link'

export function getPlayerColumns(
  mode: 'team' | 'all',
  onEditPlayer?: (
    player: PlayerType & { user?: { name: string; lastName: string } }
  ) => void
): ColumnDef<PlayerType & { user?: { name: string; lastName: string } }>[] {
  return [
    {
      accessorKey: 'avatar',
      header: 'Avatar',
      cell: ({ row }) => (
        <Avatar>
          <AvatarImage
            src={row.original.avatar ?? ''}
            alt={row.original.name}
            width={100}
            height={100}
            className='w-full h-full object-cover'
          />
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
      accessorKey: 'position',
      header: 'Position',
    },
    {
      accessorKey: 'jerseyNumber',
      header: 'Dorsal',
      cell: ({ row }) => (
        <div className='text-center font-medium'>
          {row.original.jerseyNumber ? `#${row.original.jerseyNumber}` : '-'}
        </div>
      ),
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
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex gap-2 items-center'>
          <Button
            variant='ghost'
            size='sm'
            className='text-primary p-0'
            onClick={
              onEditPlayer
                ? (e) => {
                    e.stopPropagation()
                    onEditPlayer(row.original)
                  }
                : undefined
            }
          >
            <Pencil className='w-4 h-4' />
          </Button>
          <Link href={`/admin/players/${row.original.id}`} passHref>
            <Button variant='ghost' size='sm' className='text-primary p-0'>
              <Eye className='w-4 h-4' />
            </Button>
          </Link>
          {mode === 'team' ? (
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
                } else {
                  toast.error(res.error || 'Error removing player')
                }
              }}
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          ) : (
            <Button
              variant='ghost'
              className='bg-destructive/20 text-destructive p-0 hover:bg-destructive/30'
              size='sm'
              onClick={async (e) => {
                e.stopPropagation()
                const res = await deletePlayerAction(row.original.id)
                if (res.success) {
                  toast.success('Player deleted')
                } else {
                  toast.error(res.error || 'Error deleting player')
                }
              }}
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          )}
        </div>
      ),
    },
  ]
}
