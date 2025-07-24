import { userAuth } from '@/lib/actions/auth.action'
import { getOrganizationByUserId } from '@/lib/actions/organization.action'
import { getPlayersByUserAction } from '@/lib/actions/users.action'
import { getAllMatchesWithTeams } from '@/lib/actions/matches.action'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faUser } from '@fortawesome/free-solid-svg-icons'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import Link from 'next/link'
import type { MatchWithTeams } from '@/lib/actions/matches.action'
import { getClubRecord } from '@/lib/utils/clubRecord'

export default async function MeinActionDashboard() {
  const user = await userAuth()
  if (!user) return <div className='text-center py-8'>Not logged in</div>

  const [orgResult, players, allMatches] = await Promise.all([
    getOrganizationByUserId(user.id),
    getPlayersByUserAction(user.id),
    getAllMatchesWithTeams(),
  ])
  const club = orgResult.data
  const clubMatches = club
    ? (allMatches as MatchWithTeams[])
        .filter((m) => m.team1Id === club.id || m.team2Id === club.id)
        .map((m) => ({
          ...m,
          isLive: typeof m.isLive === 'boolean' ? m.isLive : false,
        }))
    : []

  const { wins, losses, draws } = getClubRecord(club, clubMatches)

  return (
    <div className='flex justify-center items-center gap-9 w-full p-4 mt-8 md:mt-0'>
      <Link
        href='/members/join-club'
        className='flex flex-col justify-center items-center'
      >
        <Avatar>
          <AvatarImage
            src={club?.avatar || '/no-club.jpg'}
            className='w-15 h-15 md:w-30 md:h-30 rounded-full'
          />
          <AvatarFallback>{club?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col justify-center items-center mt-2 text-sm md:text-base'>
          <span className='text-center hidden md:block'>
            {club?.name || 'No Club'}
          </span>
          <span className='text-center block md:hidden text-xs'>
            {club?.name.slice(0, 2).toUpperCase() || 'No Club'}
          </span>
          <span className='text-center text-xs md:text-md'>{`W ${wins} / L ${losses} / D ${draws}`}</span>
          {/* Aquí puedes poner el récord real si lo tienes */}
        </div>
      </Link>
      <Link
        href='/members/players'
        className='flex flex-col justify-center items-center'
      >
        <div className='flex justify-center items-center w-20 h-20 md:w-30 md:h-30 bg-gray-200 rounded-full'>
          <FontAwesomeIcon
            icon={faUser}
            className='w-10 h-10 md:w-15 md:h-15 text-gray-500'
          />
        </div>
        <span className='text-xs md:text-base'>Players</span>
        <span>{players?.length || 0}</span>
      </Link>
      <Link
        href='/members/matches/live'
        className='flex flex-col justify-center items-center'
      >
        <div className='flex justify-center items-center w-20 h-20 md:w-30 md:h-30 bg-gray-200 rounded-full'>
          <FontAwesomeIcon
            icon={faCalendar}
            className='w-10 h-10 md:w-15 md:h-15 text-gray-500'
          />
        </div>
        <span className='text-xs md:text-base'>Matches</span>
        <span>{clubMatches.length}</span>
      </Link>
    </div>
  )
}
