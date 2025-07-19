import React, { useState, useEffect } from 'react'
import { UserType } from '@/types/UserType'
import { useGlobalStore } from '@/lib/stores/globalStore'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'

interface UserSearchProps {
  onSelect: (user: UserType) => void
  defaultUser?: UserType
}

export default function UserSearch({ onSelect, defaultUser }: UserSearchProps) {
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    defaultUser?.id ? String(defaultUser.id) : undefined
  )
  const [results, setResults] = useState<UserType[]>([])
  const { users, usersLoaded, loadUsers } = useGlobalStore()

  useEffect(() => {
    setSelectedUserId(defaultUser?.id ? String(defaultUser.id) : undefined)
    if (defaultUser) {
      setSearch(`${defaultUser.name} ${defaultUser.lastName}`)
    }
  }, [defaultUser])

  // Cargar usuarios si no están cargados
  useEffect(() => {
    if (!usersLoaded) {
      loadUsers()
    }
  }, [usersLoaded, loadUsers])

  // Filtrar usuarios localmente
  useEffect(() => {
    if (!search || selectedUserId) {
      setResults([])
      return
    }

    const filteredUsers = users.filter((user) => {
      const fullName = `${user.name} ${user.lastName}`.toLowerCase()
      const searchTerm = search.toLowerCase()
      return (
        fullName.includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      )
    })

    setResults(filteredUsers.slice(0, 10)) // Limitar a 10 resultados
  }, [search, selectedUserId, users])

  return (
    <div className='space-y-2'>
      <input
        type='text'
        placeholder='Search user by name...'
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setSelectedUserId(undefined)
        }}
        className='mb-2 border-2 border-gray-300 rounded-md p-2 w-full'
      />
      {!usersLoaded && (
        <div className='text-xs text-gray-400'>Loading users...</div>
      )}
      {!selectedUserId && results.length > 0 && (
        <ul className='border rounded bg-white shadow max-h-40 overflow-y-auto'>
          {results.map((user) => (
            <li
              key={user.id}
              className='px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center'
              onClick={() => {
                setSelectedUserId(user.id)
                setSearch(`${user.name} ${user.lastName}`)
                setResults([])
                onSelect(user)
              }}
            >
              <Avatar className='mr-2 w-6 h-6'>
                <AvatarImage
                  src={user.avatar || '/no-profile.webp'}
                  width={100}
                  height={100}
                  alt={user.name}
                  className='object-cover w-6 h-6 rounded-full'
                />
                <AvatarFallback className='bg-gray-500 text-md font-bold text-white'>
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {user.name} {user.lastName}{' '}
              <span className='text-xs text-gray-400'>({user.email})</span>
            </li>
          ))}
        </ul>
      )}
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
