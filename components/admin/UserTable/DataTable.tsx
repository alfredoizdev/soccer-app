'use client'

import { useState } from 'react'
import {
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

import { UpdateUserDrawer } from '@/app/(admin)/admin/users/UpdateUserDrawer'
import { UserType } from '@/types/UserType'
import { getUserColumns } from './columns'

interface DataTableProps {
  data: UserType[]
}

export default function DataTable({ data }: DataTableProps) {
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)

  const table = useReactTable({
    data,
    columns: getUserColumns((user) => {
      setSelectedUser(user)
      setOpen(true)
    }),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className='overflow-x-auto max-w-[410px] sm:max-w-full'>
      <div className='flex justify-start mb-4'>
        <input
          type='text'
          placeholder='Search'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className='w-full max-w-[200px] rounded-md border p-2'
        />
      </div>
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
                  className='hover:bg-gray-100'
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
                  colSpan={table.getAllColumns().length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Drawer para actualizar el usuario */}
        <UpdateUserDrawer
          open={open}
          setOpen={setOpen}
          user={
            selectedUser
              ? {
                  ...selectedUser,
                  avatar: selectedUser.avatar ?? undefined,
                }
              : undefined
          }
          onSuccess={() => setOpen(false)}
        />
      </div>
    </div>
  )
}
