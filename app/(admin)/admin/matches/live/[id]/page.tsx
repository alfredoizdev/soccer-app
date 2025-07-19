import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getLiveMatchData,
  initializeLiveMatchData,
} from '@/lib/actions/matches.action'
import LiveMatchPageClient from '../LiveMatchPageClient'

export default async function LiveMatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!id) return notFound()

  console.log('Loading live match page for ID:', id)

  // Intentar obtener datos en vivo existentes
  let data = await getLiveMatchData(id)

  // Si no hay datos en vivo, inicializarlos
  if (!data) {
    try {
      console.log('No live data found, initializing...')
      await initializeLiveMatchData(id)
      data = await getLiveMatchData(id)
    } catch (error) {
      console.error('Error initializing live match data:', error)

      // Mostrar una página de error más informativa
      return (
        <div className='w-full mx-auto p-4'>
          <div className='text-center py-8'>
            <h1 className='text-2xl font-bold text-red-600 mb-4'>
              Match Not Found
            </h1>
            <p className='text-gray-600 mb-4'>
              The match you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <p className='text-sm text-gray-500 mb-6'>Match ID: {id}</p>
            <div className='space-x-4'>
              <Link
                href='/admin/matches'
                className='inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
              >
                Go to Matches
              </Link>
              <Link
                href='/admin/matches/history'
                className='inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700'
              >
                View History
              </Link>
            </div>
          </div>
        </div>
      )
    }
  }

  if (!data) {
    console.error('Failed to load match data for ID:', id)
    return notFound()
  }

  console.log('Successfully loaded match data for ID:', id)

  // Convertir datos en vivo al formato esperado por el componente
  const initialPlayerStats = data.liveData

  return (
    <LiveMatchPageClient
      match={data.match}
      playersTeam1={data.playersTeam1}
      playersTeam2={data.playersTeam2}
      initialPlayerStats={initialPlayerStats}
    />
  )
}
