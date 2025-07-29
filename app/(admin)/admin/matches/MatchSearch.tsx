'use client'
import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Video, Settings } from 'lucide-react'

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
          <div className='text-gray-500 text-center py-8'>
            <p>No active matches found.</p>
            <p className='text-sm text-gray-400 mt-2'>
              Try creating a new match or check the match history for completed
              matches.
            </p>
          </div>
        ) : (
          filtered.map((match) => (
            <div
              key={match.id}
              className='p-4 bg-white rounded-lg shadow hover:shadow-md transition-all border border-gray-200'
            >
              <div className='flex items-center justify-between mb-3'>
                <Badge variant='secondary' className='text-xs'>
                  Pending
                </Badge>
                <span className='text-xs text-gray-500'>
                  {match.date instanceof Date
                    ? match.date.toLocaleDateString()
                    : new Date(match.date).toLocaleDateString()}
                </span>
              </div>

              <div className='flex items-center justify-center gap-6 mb-4'>
                <div className='text-center'>
                  <Image
                    src={match.team1Avatar || '/no-club.jpg'}
                    alt={match.team1}
                    width={48}
                    height={48}
                    className='rounded-full object-cover border-2 border-gray-200 mx-auto mb-2'
                  />
                  <div className='font-semibold text-sm'>{match.team1}</div>
                </div>

                <div className='text-center'>
                  <div className='text-2xl font-bold text-gray-400'>VS</div>
                  <div className='text-xs text-gray-500 mt-1'>
                    Ready to start
                  </div>
                </div>

                <div className='text-center'>
                  <Image
                    src={match.team2Avatar || '/no-club.jpg'}
                    alt={match.team2}
                    width={48}
                    height={48}
                    className='rounded-full object-cover border-2 border-gray-200 mx-auto mb-2'
                  />
                  <div className='font-semibold text-sm'>{match.team2}</div>
                </div>
              </div>

              <div className='flex gap-2 justify-center'>
                <Link href={`/admin/matches/live/${match.id}`}>
                  <Button
                    variant='default'
                    size='sm'
                    className='flex items-center gap-2'
                  >
                    <Settings className='w-4 h-4' />
                    Match Actions
                  </Button>
                </Link>
                <Link href={`/admin/matches/stream/${match.id}`}>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex items-center gap-2'
                  >
                    <Video className='w-4 h-4' />
                    Live Stream
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
