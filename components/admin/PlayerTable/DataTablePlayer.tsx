'use client'

import { columns } from './columns'
import { PlayerType } from '@/types/PlayerType'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useState } from 'react'
import { UpdatePlayerDrawer } from '@/app/(admin)/admin/players/UpdatePlayerDrawer'
import { UserType } from '@/types/UserType'

type PlayerWithUser = PlayerType & { user?: { name: string; lastName: string } }

export default function DataTablePlayer({
  players,
}: {
  players: PlayerWithUser[]
}) {
  const [open, setOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithUser | null>(
    null
  )

  const table = useReactTable<PlayerWithUser>({
    data: players,
    columns: columns as ColumnDef<PlayerWithUser, unknown>[],
    getCoreRowModel: getCoreRowModel(),
  })

  const handleRowClick = (player: PlayerWithUser) => {
    setSelectedPlayer(player)
    setOpen(true)
  }

  return (
    <div className='overflow-x-auto max-w-[410px] sm:max-w-full'>
      <div className='rounded-md border'>
        <Table className='min-w-[500px]'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                  className='cursor-pointer hover:bg-gray-100'
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <UpdatePlayerDrawer
        open={open}
        setOpen={setOpen}
        player={
          selectedPlayer
            ? {
                ...selectedPlayer,
                avatar: selectedPlayer.avatar ?? undefined,
                user: selectedPlayer.user as UserType,
              }
            : undefined
        }
      />
    </div>
  )
}
