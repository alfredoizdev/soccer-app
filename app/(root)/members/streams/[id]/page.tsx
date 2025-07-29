import { notFound } from 'next/navigation'
import { getStreamingSession } from '@/lib/actions/streaming.action'
import { userAuth } from '@/lib/actions/auth.action'
import StreamViewer from '@/components/members/StreamViewer'

export default async function StreamViewerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await userAuth()

  if (!user) {
    return <div>Please log in.</div>
  }

  const session = await getStreamingSession(id)

  if (!session) {
    notFound()
  }

  return (
    <div className='container mx-auto py-8'>
      <StreamViewer
        sessionId={session.id}
        streamTitle={session.title || undefined}
        broadcasterName={`Broadcaster ${session.broadcasterId.slice(0, 8)}...`}
        initialIsActive={session.isActive}
      />
    </div>
  )
}
