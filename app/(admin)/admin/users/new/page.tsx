import UserForm from '@/components/admin/UserForm'
import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'

export default function NewUserPage() {
  return (
    <div className='w-full h-full flex items-center flex-col'>
      <div className='w-full flex items-center justify-between'>
        <Link
          href='/admin/users'
          className='flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700'
        >
          <ArrowLeftIcon className='w-4 h-4' />
          Back to Users
        </Link>
      </div>
      <div className='container mx-auto py-10 w-full max-w-md'>
        <h1 className='text-2xl font-bold mb-4'>Add User</h1>
        <UserForm />
      </div>
    </div>
  )
}
