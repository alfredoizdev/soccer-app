import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileX2 } from 'lucide-react'

export default function NotFoundPost() {
  return (
    <div className='fixed inset-0 flex flex-col items-center justify-center bg-gray-50 px-4'>
      <div className='flex flex-col items-center gap-4'>
        <FileX2 className='w-16 h-16 text-gray-400 mb-2' />
        <h1 className='text-3xl font-bold text-gray-800'>Post not found</h1>
        <p className='text-base text-gray-600 mb-2'>
          Sorry, the post you are looking for does not exist or was removed.
        </p>
        <Link href='/members/posts' passHref>
          <Button variant='default' className='text-base rounded-none'>
            Back to posts
          </Button>
        </Link>
      </div>
    </div>
  )
}
