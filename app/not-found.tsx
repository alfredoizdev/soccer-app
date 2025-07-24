import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Ghost } from 'lucide-react'

export default function NotFound() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4'>
      <div className='flex flex-col items-center gap-4'>
        <Ghost className='w-16 h-16 text-gray-400 mb-2' />
        <h1 className='text-4xl font-bold text-gray-800'>404</h1>
        <p className='text-lg text-gray-600 mb-2'>Oops! Page not found</p>
        <p className='text-sm text-gray-500 mb-6 text-center'>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href='/' passHref>
          <Button variant='outline' className='text-base'>
            Go to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
