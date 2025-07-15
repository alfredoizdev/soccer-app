import React, { useState } from 'react'
import { OrganizationType } from '@/types/UserType'
import Image from 'next/image'
// import { Input } from '../ui/input' // <-- Eliminar

interface ClubSearchProps {
  clubs: OrganizationType[]
  onSelect: (club: OrganizationType) => void
  selectedClubId?: string
}

export default function ClubSearch({
  clubs,
  onSelect,
  selectedClubId,
}: ClubSearchProps) {
  const [search, setSearch] = useState('')
  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className='space-y-2'>
      <input
        type='text'
        placeholder='Search club...'
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearch(e.target.value)
        }
        className='mb-2 border-2 border-gray-300 rounded-md p-2 w-full'
      />
      <div className='max-h-60 overflow-y-auto border rounded-md bg-white'>
        {filteredClubs.length === 0 && (
          <div className='p-2 text-gray-500 text-sm'>No clubs found</div>
        )}
        {filteredClubs.map((club) => (
          <button
            type='button'
            key={club.id}
            className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 border-b last:border-b-0 transition-colors ${
              selectedClubId === club.id ? 'bg-green-100' : ''
            }`}
            onClick={() => onSelect(club)}
          >
            {club.avatar && (
              <Image
                src={club.avatar}
                alt={club.name}
                width={32}
                height={32}
                className='rounded-full object-cover border w-8 h-8'
              />
            )}
            <span className='font-medium'>{club.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
