import { notFound } from 'next/navigation'
import { initializeLiveMatchData } from '@/lib/actions/matches.action'
import LiveMatchPageClient from '../LiveMatchPageClient'

export default async function LiveMatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const matchData = await initializeLiveMatchData(id)

  if (!matchData) {
    notFound()
  }

  return (
    <LiveMatchPageClient
      match={matchData.match}
      playersTeam1={matchData.playersTeam1}
      playersTeam2={matchData.playersTeam2}
      initialPlayerStats={matchData.initialPlayerStats}
    />
  )
}
