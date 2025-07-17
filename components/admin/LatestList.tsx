import React from 'react'
import Link from 'next/link'

interface UserItem {
  id: string
  name: string
  email: string
}

interface TeamItem {
  id: string
  name: string
  avatar?: string
  description?: string
}

type LatestListProps = {
  title: string
  items: UserItem[] | TeamItem[]
  type: 'user' | 'team'
}

export default function LatestList({ title, items, type }: LatestListProps) {
  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <h2 className='text-lg font-semibold mb-4'>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id} className='mb-2'>
            <Link
              href={
                type === 'user'
                  ? `/admin/users/${item.id}`
                  : `/admin/teams/${item.id}`
              }
              className='hover:underline text-gray-600'
            >
              <span className='font-medium'>{item.name}</span>
              {type === 'user' && (
                <span className='text-gray-500 ml-2 text-sm'>
                  {(item as UserItem).email}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
