import { getMatchWithPlayers } from '@/lib/actions/matches.action'
import { notFound } from 'next/navigation'
import LiveMatchViewer from './LiveMatchViewer'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function LiveMatchPage({ params }: PageProps) {
  const { id } = await params
  const matchData = await getMatchWithPlayers(id)

  if (!matchData) {
    notFound()
  }

  return (
    <div className='mx-auto w-full'>
      <LiveMatchViewer
        match={matchData.match}
        playersTeam1={matchData.playersTeam1}
        playersTeam2={matchData.playersTeam2}
      />
    </div>
  )
}
