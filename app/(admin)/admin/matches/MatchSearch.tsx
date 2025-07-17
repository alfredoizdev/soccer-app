'use client'
import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface MatchListItem {
  id: string
  date: string | Date
  team1: string
  team2: string
  team1Id: string
  team2Id: string
  team1Goals: number
  team2Goals: number
  team1Avatar: string
  team2Avatar: string
}

type Props = {
  matches: MatchListItem[]
}

export default function MatchSearch({ matches }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return matches
    return matches.filter(
      (m) =>
        m.team1.toLowerCase().includes(query.toLowerCase()) ||
        m.team2.toLowerCase().includes(query.toLowerCase())
    )
  }, [matches, query])

  return (
    <div className='w-full mx-auto'>
      <input
        type='text'
        placeholder='Search by club name...'
        className='w-full mb-4 px-3 py-2 border rounded-md shadow-sm bg-gray-200 text-black'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className='space-y-4 max-h-[400px] sm:max-h-[100vh] overflow-y-auto'>
        {filtered.length === 0 ? (
          <div className='text-gray-500'>No matches found.</div>
        ) : (
          filtered.map((match) => (
            <Link
              key={match.id}
              href={`/admin/matches/live/${match.id}`}
              className='block'
            >
              <div className='p-4 bg-white rounded shadow hover:bg-gray-50 transition flex flex-col items-center'>
                <div className='flex items-center justify-center gap-4 mb-2'>
                  <Image
                    src={match.team1Avatar || '/no-club.jpg'}
                    alt={match.team1}
                    width={40}
                    height={40}
                    className='rounded-full object-cover border'
                  />
                  <span className='text-lg font-semibold'>vs</span>
                  <Image
                    src={match.team2Avatar || '/no-club.jpg'}
                    alt={match.team2}
                    width={40}
                    height={40}
                    className='rounded-full object-cover border'
                  />
                </div>
                <div className='font-semibold text-center'>
                  {match.team1} vs {match.team2}
                </div>
                <div className='text-xs text-gray-500 text-center'>
                  {match.date instanceof Date
                    ? match.date.toLocaleDateString()
                    : new Date(match.date).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
