import React from 'react'
import { getUserAction } from '@/lib/actions/users.action'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import {
  User,
  Mail,
  UserCircle,
  ShieldCheck,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { formatDate } from '@/lib/utils/formatDate'

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params
  const res = await getUserAction(id)
  const user = res.data && res.data[0]

  if (!user) return notFound()

  const statusColor =
    user.status === 'active' ? 'text-green-600' : 'text-red-500'
  const statusIcon =
    user.status === 'active' ? (
      <CheckCircle className='w-5 h-5 inline-block mr-1 text-green-600' />
    ) : (
      <XCircle className='w-5 h-5 inline-block mr-1 text-red-500' />
    )
  const roleIcon =
    user.role === 'admin' ? (
      <ShieldCheck className='w-5 h-5 inline-block mr-1 text-blue-600' />
    ) : (
      <UserCircle className='w-5 h-5 inline-block mr-1 text-gray-500' />
    )

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4'>
      <div className='max-w-xl mx-auto bg-white rounded-2xl shadow-2xl p-8 relative'>
        <div className='flex flex-col items-center mb-6'>
          <div className='relative w-24 h-24 mb-3 rounded-full'>
            <Image
              src={user.avatar || '/default-avatar.png'}
              width={96}
              height={96}
              alt={user.name}
              className='rounded-full object-cover border-4 border-blue-200 shadow h-24 w-24'
              priority
            />
            <span className='absolute bottom-0 right-0 bg-white rounded-full p-1 shadow'>
              {roleIcon}
            </span>
          </div>
          <div className='text-2xl font-bold text-blue-900 flex items-center gap-2'>
            <User className='w-6 h-6 text-blue-400' />
            {user.name} {user.lastName}
          </div>
          <div className='text-gray-500 flex items-center gap-1'>
            <Mail className='w-5 h-5' />
            {user.email}
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4 mb-6'>
          <div className='bg-blue-50 rounded-lg p-4 flex flex-col items-center'>
            <span className='font-medium text-gray-600'>Status</span>
            <span
              className={`mt-1 font-semibold ${statusColor} flex items-center`}
            >
              {statusIcon}
              {user.status}
            </span>
          </div>
          <div className='bg-blue-50 rounded-lg p-4 flex flex-col items-center'>
            <span className='font-medium text-gray-600'>Role</span>
            <span className='mt-1 font-semibold text-blue-700 flex items-center'>
              {roleIcon}
              {user.role}
            </span>
          </div>
          <div className='bg-blue-50 rounded-lg p-4 flex flex-col items-center col-span-2'>
            <span className='font-medium text-gray-600'>Organization</span>
            <span className='mt-1 font-semibold text-gray-800'>
              {user.organizationId || 'N/A'}
            </span>
          </div>
        </div>
        <div className='flex justify-between text-sm text-gray-400 border-t pt-4'>
          <div>
            <span className='font-medium'>Created:</span>{' '}
            {formatDate(user.createdAt)}
          </div>
          <div>
            <span className='font-medium'>Updated:</span>{' '}
            {formatDate(user.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  )
}
