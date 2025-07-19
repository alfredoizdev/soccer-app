import { userAuth } from '@/lib/actions/auth.action'
import { getUserAction } from '@/lib/actions/users.action'
import PlayerForm from '@/components/admin/PlayerForm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { UserType } from '@/types/UserType'

export default async function AddPlayerPage() {
  const userToken = await userAuth()
  const userRes = await getUserAction(userToken?.id || '')
  const user = userRes?.data?.[0] as UserType | undefined

  if (!user?.organizationId) {
    return (
      <div className='max-w-6xl mx-auto py-12 px-4 sm:px-8'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-8'>
          <h2 className='text-2xl font-bold'>Register a Player</h2>
          <Link href='/members/players'>
            <Button className='w-full sm:w-auto'>Back to My Players</Button>
          </Link>
        </div>
        <p className='text-gray-600 text-center'>
          You must join a club before you can register your players.
        </p>
      </div>
    )
  }

  return (
    <div className='max-w-6xl mx-auto py-12 px-4 sm:px-8'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-8'>
        <h2 className='text-2xl font-bold'>Add a Player</h2>
        <Link href='/members/players'>
          <Button variant='default'>Back to Players</Button>
        </Link>
      </div>
      <div className='flex justify-center'>
        <div className='w-full min-w-[300px]'>
          <PlayerForm
            action='create'
            fixedUserId={user.id}
            fixedUserName={user.name}
            fixedUserLastName={user.lastName}
            fixedOrganizationId={user.organizationId}
            redirectPath='/members/players'
          />
        </div>
      </div>
    </div>
  )
}
