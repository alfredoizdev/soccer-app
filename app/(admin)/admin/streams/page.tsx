import { getActiveStreamsAction } from '@/lib/actions/streaming-server.action'
import ActiveStreamsClient from './ActiveStreamsClient'

export default async function StreamsPage() {
  const streamsRes = await getActiveStreamsAction()
  const rawStreams = streamsRes?.data || []

  // Transformar los streams para que coincidan con la interfaz esperada
  const streams = rawStreams.map((stream) => ({
    ...stream,
    title: stream.title || '',
    description: stream.description || '',
    createdAt: stream.createdAt || new Date(),
    startedAt: stream.startedAt || undefined,
    endedAt: stream.endedAt || undefined,
  }))

  return (
    <div className='w-full mx-auto py-4 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6'>
      <div className='mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold mb-2'>Active Streams</h1>
        <p className='text-gray-600'>
          Manage and monitor active streaming sessions
        </p>
      </div>

      <ActiveStreamsClient streams={streams} />
    </div>
  )
}
