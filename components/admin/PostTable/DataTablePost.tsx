'use client'
import { getPostColumns } from './columns'
import { PostType } from '@/types/PostType'
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
import { useState, useCallback } from 'react'
import { UpdatePostDrawer } from './UpdatePostDrawer'
import { getPostsPaginatedAdminAction } from '@/lib/actions/posts.action'

export default function DataTablePost({
  posts: initialPosts,
}: {
  posts: PostType[]
}) {
  const [data, setData] = useState(initialPosts)
  const [editOpen, setEditOpen] = useState(false)
  const [editPost, setEditPost] = useState<PostType | null>(null)
  const [loading, setLoading] = useState(false)

  // Actualizar status localmente tras aprobar/rechazar
  const handleStatusChange = useCallback(
    (id: string, status: 'approved' | 'rejected') => {
      setData((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
    },
    []
  )

  const handleEditPost = useCallback((post: PostType) => {
    setEditPost(post)
    setEditOpen(true)
  }, [])

  // Recargar los posts desde el backend tras update
  const reloadPosts = async () => {
    setLoading(true)
    const res = await getPostsPaginatedAdminAction(1, 10)
    if (res.success) setData(res.data)
    setLoading(false)
  }

  const table = useReactTable<PostType>({
    data,
    columns: getPostColumns(handleStatusChange, handleEditPost) as ColumnDef<
      PostType,
      unknown
    >[],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className='overflow-x-auto max-w-[410px] sm:max-w-full'>
      <div className='flex justify-start mb-4'>
        <input
          type='text'
          placeholder='Search'
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className='w-full max-w-[200px] rounded-md border p-2'
        />
      </div>
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className='h-24 text-center'
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
      </div>
      {editOpen && editPost && (
        <UpdatePostDrawer
          open={editOpen}
          setOpen={setEditOpen}
          post={editPost}
          onSuccess={async () => {
            setEditOpen(false)
            await reloadPosts()
          }}
        />
      )}
    </div>
  )
}
