import MatchCalendarResponsive from '@/components/members/MatchCalendarResponsive'
import { getAllMatchesWithTeams } from '@/lib/actions/matches.action'

export default async function MembersMatchesCalendarPage() {
  // Obtener partidos reales
  const matches = await getAllMatchesWithTeams()
  const events = matches.map((match) => ({
    title: `${match.team1} vs ${match.team2}`,
    start: new Date(match.date),
    end: match.duration
      ? new Date(new Date(match.date).getTime() + match.duration * 1000)
      : new Date(new Date(match.date).getTime() + 2 * 60 * 60 * 1000), // 2h por defecto
    resource: {
      ...match,
      status: match.status,
    },
  }))

  return (
    <div className='w-full mx-auto py-8 px-4'>
      <h1 className='text-2xl font-bold mb-6 text-center md:text-left px-2'>
        Matches Calendar
      </h1>

      <MatchCalendarResponsive events={events} />
    </div>
  )
}
