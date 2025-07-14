import { DataTablePlayer } from '@/components/admin/PlayerTable'
import { getOrganizationAction } from '@/lib/actions/organization.action'
import { getPlayersByOrganizationAction } from '@/lib/actions/player.action'
import Image from 'next/image'
import Link from 'next/link'

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [organization, players] = await Promise.all([
    getOrganizationAction(id),
    getPlayersByOrganizationAction(id),
  ])

  const { data: organizationData, error: organizationError } = organization
  const { data: playersData, error: playersError } = players

  if (organizationError || playersError) {
    return <div>Error: {organizationError || playersError}</div>
  }

  if (!organizationData || !playersData) {
    return <div>No data</div>
  }

  return (
    <div className='container mx-auto py-10'>
      <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8'>
        {/* Club Card */}
        <div className='flex justify-center sm:justify-start w-full sm:w-1/4'>
          <div className='flex flex-col items-center gap-2 bg-white rounded-md shadow-md p-6 w-full max-w-xs mx-auto'>
            <Image
              src={organizationData.avatar}
              alt={organizationData.name}
              width={100}
              height={100}
              className='w-24 h-24 object-contain rounded-full mb-2'
            />
            <h1 className='text-2xl font-bold text-center'>
              {organizationData.name}
            </h1>
          </div>
        </div>
        {/* Players Table */}
        <div className='flex flex-col w-full sm:w-3/4 mt-8 sm:mt-0'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2'>
            <h1 className='text-2xl font-bold'>Players</h1>
            <Link
              href={`/admin/players/new?organization_id=${organizationData.id}`}
              className='inline-block px-4 py-2 bg-gray-800 text-white rounded-md shadow hover:bg-gray-700 transition-colors text-sm font-semibold text-center'
            >
              Add Player
            </Link>
          </div>
          <DataTablePlayer players={playersData} />
        </div>
      </div>
    </div>
  )
}
