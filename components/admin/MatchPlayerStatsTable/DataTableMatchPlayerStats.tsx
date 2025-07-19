'use client'

import { getMatchPlayerStatsColumns, MatchPlayerStats } from './columns'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function DataTableMatchPlayerStats({
  players,
}: {
  players: MatchPlayerStats[]
}) {
  const table = useReactTable<MatchPlayerStats>({
    data: players,
    columns: getMatchPlayerStatsColumns() as ColumnDef<
      MatchPlayerStats,
      unknown
    >[],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className='w-full'>
      {/* Search bar */}
      <div className='flex justify-start mb-4'>
        <input
          type='text'
          placeholder='Search players...'
          value={(table.getColumn('player')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('player')?.setFilterValue(event.target.value)
          }
          className='w-full max-w-[200px] rounded-md border p-2 text-sm'
        />
      </div>

      {/* Desktop Table */}
      <div className='hidden lg:block'>
        <div className='rounded-md border overflow-x-auto'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className='whitespace-nowrap'>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='hover:bg-gray-100'
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className='whitespace-nowrap'>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className='h-24 text-center'
                  >
                    No players found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className='lg:hidden space-y-4'>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const player = row.original
            return (
              <div
                key={row.id}
                className='bg-white border rounded-lg p-4 space-y-3'
              >
                {/* Player Info */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <Avatar className='w-12 h-12'>
                      <AvatarImage
                        src={player.avatar || '/no-profile.webp'}
                        alt={player.name}
                      />
                      <AvatarFallback>
                        {player.name.charAt(0)}
                        {player.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className='font-medium text-sm'>
                        {player.name} {player.lastName}
                      </div>
                      <div className='text-xs text-gray-500'>
                        #{player.jerseyNumber} • {player.position}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Avatar className='w-6 h-6'>
                      <AvatarImage
                        src={player.teamAvatar || '/no-club.jpg'}
                        alt={player.team}
                      />
                      <AvatarFallback>
                        {player.team?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <span className='text-xs text-gray-600'>{player.team}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className='grid grid-cols-2 gap-3'>
                  <div className='bg-blue-50 rounded-lg p-3'>
                    <div className='text-xs text-gray-600'>Goals</div>
                    <div className='text-lg font-bold text-blue-600'>
                      {player.stats?.goals || 0}
                    </div>
                  </div>
                  <div className='bg-green-50 rounded-lg p-3'>
                    <div className='text-xs text-gray-600'>Assists</div>
                    <div className='text-lg font-bold text-green-600'>
                      {player.stats?.assists || 0}
                    </div>
                  </div>
                  <div className='bg-yellow-50 rounded-lg p-3'>
                    <div className='text-xs text-gray-600'>Minutes</div>
                    <div className='text-lg font-bold text-yellow-600'>
                      {player.stats?.minutesPlayed || 0}
                    </div>
                  </div>
                  <div className='bg-purple-50 rounded-lg p-3'>
                    <div className='text-xs text-gray-600'>Passes</div>
                    <div className='text-lg font-bold text-purple-600'>
                      {player.stats?.passesCompleted || 0}
                    </div>
                  </div>

                  {player.position === 'goalkeeper' && (
                    <>
                      <div className='bg-emerald-50 rounded-lg p-3'>
                        <div className='text-xs text-gray-600'>Goals Saved</div>
                        <div className='text-lg font-bold text-emerald-600'>
                          {player.stats?.goalsSaved || 0}
                        </div>
                      </div>
                      <div className='bg-orange-50 rounded-lg p-3'>
                        <div className='text-xs text-gray-600'>
                          Goals Allowed
                        </div>
                        <div className='text-lg font-bold text-orange-600'>
                          {player.stats?.goalsAllowed || 0}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Action Button */}
                <div className='flex justify-end pt-2'>
                  <a
                    href={`/admin/players/${player.id}`}
                    className='inline-flex items-center text-blue-600 hover:text-blue-800 text-sm'
                  >
                    View Details →
                  </a>
                </div>
              </div>
            )
          })
        ) : (
          <div className='text-center py-8 text-gray-500'>
            No players found.
          </div>
        )}
      </div>
    </div>
  )
}
