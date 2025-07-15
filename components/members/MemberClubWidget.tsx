'use client'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { OrganizationType, UserType } from '@/types/UserType'
import Image from 'next/image'
import Link from 'next/link'

export default function MemberClubWidget({
  club,
}: {
  club: OrganizationType | null
  user: UserType
}) {
  // Aquí puedes agregar lógica de join/leave club con useTransition o useState
  // Por ahora solo muestra la UI
  return (
    <Card className='p-6 flex flex-col gap-4 items-center w-full'>
      <CardContent className='flex flex-col gap-4 items-center w-full'>
        {club && (
          <>
            <div className='flex items-center gap-4'>
              {club.avatar && (
                <Image
                  width={64}
                  height={64}
                  src={club.avatar}
                  alt={club.name}
                  className='w-16 h-16 rounded-full object-cover border'
                />
              )}
              <div>
                <h2 className='text-xl font-bold'>{club.name}</h2>
                <p className='text-gray-600'>{club.description}</p>
              </div>
            </div>
            <form action='/members/join-club' method='POST'>
              <Button type='submit' variant='destructive'>
                Leave Club
              </Button>
            </form>
          </>
        )}
        {!club && (
          <>
            <h2 className='text-lg font-bold text-center'>
              You are not a member of any club.
            </h2>
            <p className='text-center'>
              You can join a club to start using the platform.
            </p>
            <Link
              href='/members/join-club'
              className='bg-red-500 text-white p-2 rounded-md w-full text-center'
            >
              Join Club
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}
