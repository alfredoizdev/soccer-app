import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAllMatchesWithTeams } from '@/lib/actions/matches.action'
import MatchSearch from './MatchSearch'

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

export default async function MatchesPage() {
  const allMatches: MatchListItem[] = await getAllMatchesWithTeams()

  console.log(
    'All matches:',
    allMatches.map((m) => ({
      id: m.id,
      team1Goals: m.team1Goals,
      team2Goals: m.team2Goals,
      isCompleted: m.team1Goals > 0 || m.team2Goals > 0,
    }))
  )

  // Filtrar solo partidos que NO han finalizado (sin goles registrados)
  const activeMatches = allMatches.filter(
    (match) => match.team1Goals === 0 && match.team2Goals === 0
  )

  console.log('Active matches count:', activeMatches.length)
  console.log(
    'Active matches:',
    activeMatches.map((m) => m.id)
  )

  return (
    <div className='w-full px-4 mx-auto mt-5 animate-fade-in duration-500'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold'>Active Matches</h1>
        <div className='flex gap-2'>
          <Link href='/admin/matches/history'>
            <Button variant='outline'>View History</Button>
          </Link>
          <Link href='/admin/matches/new'>
            <Button>New match</Button>
          </Link>
        </div>
      </div>

      {activeMatches.length === 0 ? (
        <div className='text-center py-8'>
          <p className='text-gray-500 mb-4'>No active matches found.</p>
          <p className='text-sm text-gray-400'>
            Completed matches can be viewed in the{' '}
            <Link
              href='/admin/matches/history'
              className='text-blue-600 hover:underline'
            >
              Match History
            </Link>
          </p>
        </div>
      ) : (
        <MatchSearch matches={activeMatches} />
      )}
    </div>
  )
}
