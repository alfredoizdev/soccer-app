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
  const matches: MatchListItem[] = await getAllMatchesWithTeams()
  return (
    <div className='w-full px-4 mx-auto mt-5'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold'>Matches</h1>
        <Link href='/admin/matches/new'>
          <Button>New match</Button>
        </Link>
      </div>
      <MatchSearch matches={matches} />
    </div>
  )
}
