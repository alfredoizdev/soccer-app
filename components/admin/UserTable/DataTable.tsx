'use client'

import { useState } from 'react'
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

import { UpdateUserDrawer } from '@/app/(admin)/admin/users/UpdateUserDrawer'
import { UserType } from '@/types/UserType'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
}

export default function DataTable<TData extends UserType, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<TData | null>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const handleRowClick = (user: TData) => {
    setSelectedUser(user)
    setOpen(true)
  }

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
        {/* Drawer para actualizar el usuario */}
        {selectedUser && (
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
        )}
      </div>
    </div>
  )
}
