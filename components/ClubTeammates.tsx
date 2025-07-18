import Image from 'next/image'
import Link from 'next/link'

export interface ClubTeammate {
  id: string
  name: string
  lastName: string
  avatar?: string | null
}

interface ClubTeammatesProps {
  teammates: ClubTeammate[]
  pathBase: string // e.g. '/admin/players/' or '/members/players/'
}

export default function ClubTeammates({
  teammates,
  pathBase,
}: ClubTeammatesProps) {
  if (!teammates.length) return null
  return (
    <div className='mb-6 w-full flex flex-col items-center justify-center'>
      <div className='text-sm font-semibold mb-2'>
        Other players in this club:
      </div>
      <div className='flex -space-x-3'>
        {teammates.map((tm) => (
          <Link key={tm.id} href={`${pathBase}${tm.id}`}>
            <Image
              src={tm.avatar || '/no-profile.webp'}
              alt={tm.name}
              width={40}
              height={40}
              className='rounded-full border-2 border-white object-cover w-10 h-10 hover:scale-110 transition-transform'
              title={`${tm.name} ${tm.lastName}`}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
