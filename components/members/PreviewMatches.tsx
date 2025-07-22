import { MatchWithTeams } from '@/lib/actions/matches.action'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import Link from 'next/link'
import { PlayIcon } from 'lucide-react'

export default function PreviewMatches({
  matches,
}: {
  matches: MatchWithTeams[]
}) {
  if (matches.length === 0)
    return (
      <div className='flex flex-col gap-4 w-full'>
        <h3 className='text-lg font-semibold'>Preview Matches</h3>
        <p className='text-gray-500 text-center p-6'>No matches found</p>
      </div>
    )

  return (
    <div className='flex flex-col gap-4 w-full'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Preview Matches</h3>
        <Link
          href='/members/matches/live'
          className='text-sm bg-gray-500 p-1 rounded-md text-white'
        >
          All Matches
        </Link>
      </div>

      {matches?.slice(0, 3).map((match) => (
        <Link
          href={`/members/matches/live/${match.id}`}
          key={match.id}
          className='flex justify-start items-center gap-2 bg-gray-100 p-2 rounded-md'
        >
          <div className='flex flex-col gap-2 w-2/3'>
            <div className='flex items-center gap-2 p-2 rounded-md'>
              <Avatar>
                <AvatarImage src={match.team1Avatar} />
                <AvatarFallback>{match.team1.charAt(0)}</AvatarFallback>
              </Avatar>
              <h4 className='hidden sm:block text-xs sm:text-sm font-semibold'>
                {match.team1.toUpperCase()}
              </h4>
              <h4 className='block sm:hidden text-xs font-semibold'>
                {match.team1.slice(0, 2).toUpperCase()}
              </h4>
              <p>{match.team1Goals}</p>
            </div>
            <div className='flex items-center gap-2 p-2 rounded-md'>
              <Avatar>
                <AvatarImage src={match.team2Avatar} />
                <AvatarFallback>{match.team2.charAt(0)}</AvatarFallback>
              </Avatar>
              <h4 className='hidden sm:block text-xs sm:text-sm font-semibold'>
                {match.team2.toUpperCase()}
              </h4>
              <h4 className='block sm:hidden text-xs font-semibold'>
                {match.team2.slice(0, 2).toUpperCase()}
              </h4>
              <p>{match.team2Goals}</p>
            </div>
          </div>
          <div className='flex items-center justify-center w-1/2 h-full'>
            <div className='flex items-center gap-2 bg-gray-200 p-2 rounded-md'>
              <span className='text-sm font-semibold hidden sm:block'>
                Watch
              </span>
              <PlayIcon className='w-4 h-4' />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
