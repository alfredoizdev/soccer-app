import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export type MatchPlayerStats = {
  id: string
  name: string
  lastName: string
  avatar?: string | null
  jerseyNumber?: number | null
  position?: string | null
  team: string
  teamAvatar: string
  stats?: {
    goals: number
    assists: number
    minutesPlayed: number
    passesCompleted: number
    goalsSaved: number
    goalsAllowed: number
  }
}

export function getMatchPlayerStatsColumns(): ColumnDef<MatchPlayerStats>[] {
  return [
    {
      accessorKey: 'player',
      header: 'Player',
      cell: ({ row }) => (
        <div className='flex items-center space-x-3'>
          <Avatar>
            <AvatarImage
              src={row.original.avatar ?? ''}
              alt={row.original.name}
              className='w-full h-full object-cover'
            />
            <AvatarFallback className='bg-gray-500 text-white'>
              {row.original.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className='font-medium'>
              {row.original.name} {row.original.lastName}
            </div>
            <div className='text-sm text-gray-500'>
              #{row.original.jerseyNumber} • {row.original.position}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'team',
      header: 'Team',
      cell: ({ row }) => (
        <div className='flex items-center space-x-2'>
          <Avatar className='w-5 h-5'>
            <AvatarImage
              src={row.original.teamAvatar ?? ''}
              alt={row.original.team}
              className='w-full h-full object-cover'
            />
            <AvatarFallback className='bg-gray-500 text-white text-xs'>
              {row.original.team.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className='text-sm'>{row.original.team}</span>
        </div>
      ),
    },
    {
      accessorKey: 'goals',
      header: 'Goals',
      cell: ({ row }) => (
        <div className='text-center font-medium'>
          {row.original.stats?.goals || 0}
        </div>
      ),
    },
    {
      accessorKey: 'assists',
      header: 'Assists',
      cell: ({ row }) => (
        <div className='text-center font-medium'>
          {row.original.stats?.assists || 0}
        </div>
      ),
    },
    {
      accessorKey: 'minutesPlayed',
      header: 'Minutes',
      cell: ({ row }) => (
        <div className='text-center font-medium'>
          {row.original.stats?.minutesPlayed || 0}
        </div>
      ),
    },
    {
      accessorKey: 'passesCompleted',
      header: 'Passes',
      cell: ({ row }) => (
        <div className='text-center font-medium'>
          {row.original.stats?.passesCompleted || 0}
        </div>
      ),
    },

    {
      accessorKey: 'goalsSaved',
      header: 'Goals Saved',
      cell: ({ row }) => (
        <div className='text-center font-medium'>
          {row.original.stats?.goalsSaved || 0}
        </div>
      ),
    },
    {
      accessorKey: 'goalsAllowed',
      header: 'Goals Allowed',
      cell: ({ row }) => (
        <div className='text-center font-medium'>
          {row.original.stats?.goalsAllowed || 0}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className='text-center'>
          <Link href={`/admin/players/${row.original.id}`}>
            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
              <Eye className='h-4 w-4' />
              <span className='sr-only'>View player details</span>
            </Button>
          </Link>
        </div>
      ),
    },
  ]
}
