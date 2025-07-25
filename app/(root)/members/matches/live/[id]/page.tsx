import { getMatchWithPlayers } from '@/lib/actions/matches.action'
import { notFound } from 'next/navigation'
import LiveMatchViewer from './LiveMatchViewer'

export default async function LiveMatchViewerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const matchData = await getMatchWithPlayers(id)

  if (!matchData) {
    notFound()
  }

  return (
    <LiveMatchViewer
      match={matchData}
      playersTeam1={matchData.playersTeam1}
      playersTeam2={matchData.playersTeam2}
    />
  )
}
