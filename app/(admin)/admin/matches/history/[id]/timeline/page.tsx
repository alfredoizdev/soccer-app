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

  // Eventos de ejemplo para mostrar el timeline (en producción estos vendrían de la base de datos)
  const exampleEvents: MatchEvent[] = [
    {
      id: '1',
      minute: 15,
      eventType: 'pass',
      playerName: 'Juan Pérez',
      teamName: match.match.team1,
      teamAvatar: match.match.team1Avatar,
    },
    {
      id: '2',
      minute: 27,
      eventType: 'goal',
      playerName: 'Pedro Ruiz',
      teamName: match.match.team1,
      teamAvatar: match.match.team1Avatar,
    },
    {
      id: '3',
      minute: 34,
      eventType: 'assist',
      playerName: 'Luis Gómez',
      teamName: match.match.team1,
      teamAvatar: match.match.team1Avatar,
    },
    {
      id: '4',
      minute: 45,
      eventType: 'pass',
      playerName: 'Carlos Silva',
      teamName: match.match.team2,
      teamAvatar: match.match.team2Avatar,
    },
    {
      id: '5',
      minute: 59,
      eventType: 'goal',
      playerName: 'Miguel Torres',
      teamName: match.match.team1,
      teamAvatar: match.match.team1Avatar,
    },
    {
      id: '6',
      minute: 72,
      eventType: 'pass',
      playerName: 'Roberto Díaz',
      teamName: match.match.team1,
      teamAvatar: match.match.team1Avatar,
    },
    {
      id: '7',
      minute: 78,
      eventType: 'assist',
      playerName: 'Ana Martínez',
      teamName: match.match.team2,
      teamAvatar: match.match.team2Avatar,
    },
    {
      id: '8',
      minute: 85,
      eventType: 'pass',
      playerName: 'Diego López',
      teamName: match.match.team2,
      teamAvatar: match.match.team2Avatar,
    },
  ]

  // Usar eventos de ejemplo si no hay eventos reales
  const timelineEvents =
    events.length > 0 ? (events as MatchEvent[]) : exampleEvents

  return (
    <MatchTimelinePage
      events={timelineEvents}
      team1Name={match.match.team1}
      team2Name={match.match.team2}
      team1Avatar={match.match.team1Avatar}
      team2Avatar={match.match.team2Avatar}
      matchId={id}
    />
  )
}
