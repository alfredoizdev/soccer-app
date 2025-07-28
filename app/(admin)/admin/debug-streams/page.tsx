'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cleanupAllActiveSessionsAction } from '@/lib/actions/streaming-server.action'
import { toast } from 'sonner'

export default function DebugStreamsPage() {
  const handleCleanup = async () => {
    try {
      const result = await cleanupAllActiveSessionsAction()

      if (result.success) {
        toast.success(`Cleaned up ${result.data?.length || 0} active sessions`)
      } else {
        toast.error(result.error || 'Failed to clean up sessions')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to clean up sessions')
    }
  }

  return (
    <div className='container mx-auto p-6'>
      <Card className='p-6'>
        <h1 className='text-2xl font-bold mb-4'>Debug Streaming Sessions</h1>
        <p className='text-gray-600 mb-4'>
          This page is for debugging purposes. Use it to clean up active
          streaming sessions.
        </p>
        <Button onClick={handleCleanup} variant='destructive'>
          Clean Up All Active Sessions
        </Button>
      </Card>
    </div>
  )
}
