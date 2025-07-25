import {
  getMatchWithPlayers,
  getMatchEvents,
} from '@/lib/actions/matches.action'
import MatchTimelinePage, {
  MatchEvent,
} from '@/components/admin/MatchTimelinePage'
import { notFound } from 'next/navigation'

interface MatchTimelinePageProps {
  params: Promise<{ id: string }>
}

export default async function MatchTimelinePageRoute({
  params,
}: MatchTimelinePageProps) {
  const { id } = await params

  const matchRes = await getMatchWithPlayers(id)
  const eventsRes = await getMatchEvents(id)

  if (!matchRes) return notFound()

  const match = matchRes
  const events = eventsRes || []

  // Convertir eventos de la base de datos al formato del componente
  const timelineEvents: MatchEvent[] = events.map((event) => ({
    id: event.id,
    minute: event.minute,
    eventType: event.eventType as MatchEvent['eventType'],
    playerId: event.playerId || undefined, // Convertir null a undefined
    playerName: event.playerName,
    playerAvatar: event.playerAvatar || undefined, // Convertir null a undefined
    teamName: event.teamName,
    teamAvatar: event.teamAvatar || undefined,
    description: event.description || undefined,
    teamId: event.teamId, // Agregar teamId para posicionamiento
  }))

  return (
    <MatchTimelinePage
      events={timelineEvents}
      team1Name={match.team1}
      team2Name={match.team2}
      team1Avatar={match.team1Avatar}
      team2Avatar={match.team2Avatar}
      team1Id={match.team1Id}
      team2Id={match.team2Id}
      matchId={id}
      team1Goals={match.team1Goals || 0}
      team2Goals={match.team2Goals || 0}
      duration={match.duration || undefined}
    />
  )
}
