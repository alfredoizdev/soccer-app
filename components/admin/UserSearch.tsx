import React, { useState, useEffect } from 'react'
import { UserType } from '@/types/UserType'

interface UserSearchProps {
  onSelect: (user: UserType) => void
  defaultUser?: UserType
}

export default function UserSearch({ onSelect, defaultUser }: UserSearchProps) {
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    defaultUser?.id ? String(defaultUser.id) : undefined
  )

  useEffect(() => {
    setSelectedUserId(defaultUser?.id ? String(defaultUser.id) : undefined)
    if (defaultUser) {
      setSearch(`${defaultUser.name} ${defaultUser.lastName}`)
    }
  }, [defaultUser])

  return (
    <div className='space-y-2'>
      <input
        type='text'
        placeholder='Search user by name...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='mb-2 border-2 border-gray-300 rounded-md p-2 w-full'
      />
      {selectedUserId && (
        <button
          type='button'
          className='mt-2 text-xs bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-gray-200 rounded px-3 py-1'
          onClick={() => {
            setSelectedUserId(undefined)
            setSearch('')
            onSelect({} as UserType)
          }}
        >
          Remove parent selection
        </button>
      )}
    </div>
  )
}
