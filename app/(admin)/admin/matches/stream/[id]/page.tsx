import React from 'react'
import { notFound } from 'next/navigation'
import { getMatchWithPlayers } from '@/lib/actions/matches.action'
import StreamPageClient from './StreamPageClient'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function StreamPage({ params }: PageProps) {
  const { id } = await params
  const matchData = await getMatchWithPlayers(id)

  if (!matchData) {
    notFound()
  }

  return (
    <div className='w-full mx-auto py-4 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6'>
      <StreamPageClient
        matchId={matchData.id}
        matchTitle={`${matchData.team1} vs ${matchData.team2}`}
        team1={matchData.team1}
        team2={matchData.team2}
        team1Avatar={matchData.team1Avatar}
        team2Avatar={matchData.team2Avatar}
      />
    </div>
  )
}
