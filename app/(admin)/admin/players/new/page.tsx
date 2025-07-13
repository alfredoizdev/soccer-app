import PlayerForm from '@/components/admin/PlayerForm'
import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'

export default function NewPlayerPage() {
  return (
    <div className='w-full h-full flex items-center flex-col'>
      <div className='w-full flex items-center justify-between'>
        <Link
          href='/admin/players'
          className='flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700'
        >
          <ArrowLeftIcon className='w-4 h-4' />
          Back to Players
        </Link>
      </div>
      <div className='container mx-auto py-10 w-full max-w-md'>
        <h1 className='text-2xl font-bold mb-4'>Add Player</h1>
        <PlayerForm />
      </div>
    </div>
  )
}
