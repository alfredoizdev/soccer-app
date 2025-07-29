import { notFound } from 'next/navigation'
import { getActiveSessionByMatchIdAction } from '@/lib/actions/streaming-server.action'
import { getMatchWithPlayers } from '@/lib/actions/matches.action'
import MatchStreamsClient from './MatchStreamsClient'

interface MatchStreamsPageProps {
  params: Promise<{ matchId: string }>
}

export default async function MatchStreamsPage({
  params,
}: MatchStreamsPageProps) {
  const { matchId } = await params

  // Obtener información del match
  const matchData = await getMatchWithPlayers(matchId)
  if (!matchData) {
    notFound()
  }

  // Obtener stream activo para este match
  const streamRes = await getActiveSessionByMatchIdAction(matchId)
  const rawStream = streamRes?.data || null

  // Transformar el stream para que coincida con la interfaz esperada
  const stream = rawStream
    ? {
        ...rawStream,
        title: rawStream.title || '',
        description: rawStream.description || '',
        createdAt: rawStream.createdAt || new Date(),
        startedAt: rawStream.startedAt || undefined,
        endedAt: rawStream.endedAt || undefined,
      }
    : null

  return (
    <div className='w-full mx-auto py-4 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6'>
      <div className='mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold mb-2'>
          Streams for Match
        </h1>
        <p className='text-gray-600'>
          {matchData.team1} vs {matchData.team2}
        </p>
      </div>

      <MatchStreamsClient
        match={{
          id: matchData.id,
          date: matchData.date,
          team1: matchData.team1,
          team2: matchData.team2,
          team1Id: matchData.team1Id,
          team2Id: matchData.team2Id,
          team1Goals: matchData.team1Goals,
          team2Goals: matchData.team2Goals,
          team1Avatar: matchData.team1Avatar,
          team2Avatar: matchData.team2Avatar,
          duration: matchData.duration,
          status: matchData.status,
          location: matchData.location,
        }}
        stream={stream}
        matchId={matchId}
      />
    </div>
  )
}
