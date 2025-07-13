'use client'

import { useState } from 'react'
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

import { UpdateTeamDrawer } from '@/app/(admin)/admin/teams/UpdateTeamDrawer'
import { OrganizationType } from '@/types/UserType'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export default function DataTableTeam<TData extends OrganizationType, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  // Estado para el drawer y el equipo seleccionado
  const [open, setOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<TData | null>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Handler para click en la fila
  const handleRowClick = (team: TData) => {
    setSelectedTeam(team)
    setOpen(true)
  }

  return (
    <div className='overflow-x-auto max-w-[410px] sm:max-w-full'>
      <div className='rounded-md border'>
        <Table className='min-w-[500px]'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
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
      {/* Drawer para actualizar el equipo */}
      {selectedTeam && (
        <UpdateTeamDrawer open={open} setOpen={setOpen} team={selectedTeam} />
      )}
    </div>
  )
}
