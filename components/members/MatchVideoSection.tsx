import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Play } from 'lucide-react'

interface MatchVideoSectionProps {
  matchId: string
  team1Name: string
  team2Name: string
}

export default function MatchVideoSection({
  matchId,
  team1Name,
  team2Name,
}: MatchVideoSectionProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)

  return (
    <div className='p-2 sm:p-4 mb-5'>
      <Card className='border-2 border-gray-200 shadow-sm rounded-none'>
        <CardHeader className='text-center pb-3'>
          <CardTitle className='text-lg text-gray-700 flex items-center justify-center gap-2'>
            <Video className='w-5 h-5' />
            Match Highlights
          </CardTitle>
        </CardHeader>
        <CardContent className='pb-6'>
          <div className='relative aspect-video bg-gray-100 rounded-none overflow-hidden'>
            {/* Video del match */}
            <video
              className='w-full h-full object-cover'
              controls
              preload='metadata'
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src='/g1.mp4' type='video/mp4' />
              Your browser does not support the video tag.
            </video>

            {/* Thumbnail overlay cuando no está reproduciendo */}
            {!isPlaying && (
              <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                <div className='text-center'>
                  <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto'>
                    <Play className='w-8 h-8 text-white ml-1' />
                  </div>
                  <p className='text-white text-sm font-medium mb-2'>
                    {team1Name} vs {team2Name}
                  </p>
                  <p className='text-white/80 text-xs'>
                    Click to play highlights
                  </p>
                </div>
              </div>
            )}

            {/* Overlay con información del match */}
            <div className='absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-xs'>
              Match ID: {matchId.slice(0, 8)}...
            </div>
          </div>

          {/* Información adicional */}
          <div className='mt-4 text-center'>
            <p className='text-gray-600 text-sm'>
              {team1Name} vs {team2Name} - Match Highlights
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
