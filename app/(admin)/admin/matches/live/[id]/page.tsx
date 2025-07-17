import { notFound } from 'next/navigation'
import { getMatchWithPlayers } from '@/lib/actions/matches.action'
import LiveMatchPageClient from '../LiveMatchPageClient'

export default async function LiveMatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!id) return notFound()
  const data = await getMatchWithPlayers(id)
  if (!data) return notFound()
  return (
    <LiveMatchPageClient
      match={data.match}
      playersTeam1={data.playersTeam1}
      playersTeam2={data.playersTeam2}
    />
  )
}
