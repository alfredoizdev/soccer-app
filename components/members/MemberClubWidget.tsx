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
    <Card className='p-6 flex w-full rounded-none'>
      <CardContent className='flex flex-col gap-4 items-center w-full'>
        {club && (
          <>
            {club.avatar && (
              <Image
                width={128}
                height={128}
                src={club.avatar}
                alt={club.name}
                className='w-[70px] h-[70px] rounded-full object-cover'
              />
            )}
            <div>
              <h2 className='text-xl font-bold'>{club.name.toUpperCase()}</h2>
            </div>
            <div className='flex flex-col gap-2 items-center justify-center'>
              <h3 className='text-sm text-gray-500'>Score</h3>
              <p className='text-sm text-gray-500'>V - 10 / D - 3 / L - 5</p>
            </div>

            <form action='/members/join-club' method='POST'>
              <Button
                type='submit'
                variant='destructive'
                className='rounded-none'
              >
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
