import { ColumnDef } from '@tanstack/react-table'
import { PostType } from '@/types/PostType'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Check, X, Pencil } from 'lucide-react'
import { updatePost } from '@/lib/actions/posts.action'

export function getPostColumns(
  onStatusChange?: (id: string, status: 'approved' | 'rejected') => void,
  onEditPost?: (post: PostType) => void
): ColumnDef<PostType>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'userName',
      header: 'Author',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) =>
        row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString()
          : '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === 'approved'
              ? 'default'
              : row.original.status === 'pending'
              ? 'secondary'
              : 'destructive'
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'mediaType',
      header: 'Type',
      cell: ({ row }) => (
        <span className='capitalize'>{row.original.mediaType || 'text'}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className='flex gap-2'>
          <Button
            variant='ghost'
            className='rounded-none text-green-700'
            size='sm'
            disabled={row.original.status === 'approved'}
            onClick={async () => {
              const res = await updatePost({
                id: row.original.id,
                status: 'approved',
                mediaUrl: row.original.mediaUrl,
                mediaType: row.original.mediaType,
              })
              if (res.success) {
                toast.success('Post approved')
                if (onStatusChange) onStatusChange(row.original.id, 'approved')
              } else {
                toast.error(res.error || 'Error approving post')
              }
            }}
          >
            <Check className='w-4 h-4' />
          </Button>
          <Button
            variant='ghost'
            className='rounded-none text-destructive'
            size='sm'
            disabled={row.original.status === 'rejected'}
            onClick={async () => {
              const res = await updatePost({
                id: row.original.id,
                status: 'rejected',
                mediaUrl: row.original.mediaUrl,
                mediaType: row.original.mediaType,
              })
              if (res.success) {
                toast.success('Post rejected')
                if (onStatusChange) onStatusChange(row.original.id, 'rejected')
              } else {
                toast.error(res.error || 'Error rejecting post')
              }
            }}
          >
            <X className='w-4 h-4' />
          </Button>
          <Button
            variant='ghost'
            className='rounded-none'
            size='sm'
            onClick={() => onEditPost && onEditPost(row.original)}
          >
            <Pencil className='w-4 h-4' />
          </Button>
        </div>
      ),
    },
  ]
}
