'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Video,
  Mic,
  Users,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import Link from 'next/link'
import StreamBroadcaster from '@/components/admin/StreamBroadcaster'

interface StreamPageClientProps {
  matchId: string
  matchTitle: string
  team1: string
  team2: string
  team1Avatar: string
  team2Avatar: string
}

export default function StreamPageClient({
  matchId,
  matchTitle,
  team1,
  team2,
  team1Avatar,
  team2Avatar,
}: StreamPageClientProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div className='w-full mx-auto animate-fade-in duration-500'>
      {/* Header minimalista */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <Link href='/admin/matches'>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center gap-2'
            >
              <ArrowLeft className='w-4 h-4' />
              Back to Matches
            </Button>
          </Link>
          <div className='flex items-center gap-3'>
            <Avatar className='w-8 h-8'>
              <AvatarImage src={team1Avatar} alt={team1} />
              <AvatarFallback>{team1[0]}</AvatarFallback>
            </Avatar>
            <span className='text-lg font-semibold'>vs</span>
            <Avatar className='w-8 h-8'>
              <AvatarImage src={team2Avatar} alt={team2} />
              <AvatarFallback>{team2[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={toggleFullscreen}
            className='flex items-center gap-2'
          >
            {isFullscreen ? (
              <Minimize2 className='w-4 h-4' />
            ) : (
              <Maximize2 className='w-4 h-4' />
            )}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {/* Título del partido */}
      <div className='text-center mb-6'>
        <h1 className='text-2xl md:text-3xl font-bold mb-2'>{matchTitle}</h1>
        <p className='text-gray-600'>Live streaming session</p>
      </div>

      {/* Información del partido compacta */}
      <Card className='p-4 mb-6'>
        <div className='flex items-center justify-center gap-8'>
          <div className='text-center'>
            <Avatar className='w-12 h-12 mx-auto mb-2'>
              <AvatarImage src={team1Avatar} alt={team1} />
              <AvatarFallback className='text-sm'>{team1[0]}</AvatarFallback>
            </Avatar>
            <h3 className='font-semibold text-sm'>{team1}</h3>
          </div>

          <div className='text-center'>
            <div className='text-2xl font-bold text-gray-400'>VS</div>
            <div className='text-xs text-gray-500'>Live Match</div>
          </div>

          <div className='text-center'>
            <Avatar className='w-12 h-12 mx-auto mb-2'>
              <AvatarImage src={team2Avatar} alt={team2} />
              <AvatarFallback className='text-sm'>{team2[0]}</AvatarFallback>
            </Avatar>
            <h3 className='font-semibold text-sm'>{team2}</h3>
          </div>
        </div>
      </Card>

      {/* Componente de streaming principal */}
      <div className='max-w-6xl mx-auto'>
        <StreamBroadcaster matchId={matchId} matchTitle={matchTitle} />
      </div>

      {/* Información adicional compacta */}
      <Card className='p-4 mt-6'>
        <h3 className='text-lg font-semibold mb-3'>Streaming Features</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='text-center p-3 bg-gray-50 rounded-lg'>
            <Video className='w-6 h-6 mx-auto mb-2 text-blue-500' />
            <h4 className='font-medium mb-1 text-sm'>High Quality Video</h4>
            <p className='text-xs text-gray-600'>
              Crystal clear video streaming
            </p>
          </div>
          <div className='text-center p-3 bg-gray-50 rounded-lg'>
            <Mic className='w-6 h-6 mx-auto mb-2 text-green-500' />
            <h4 className='font-medium mb-1 text-sm'>Audio Control</h4>
            <p className='text-xs text-gray-600'>Mute/unmute audio as needed</p>
          </div>
          <div className='text-center p-3 bg-gray-50 rounded-lg'>
            <Users className='w-6 h-6 mx-auto mb-2 text-purple-500' />
            <h4 className='font-medium mb-1 text-sm'>Live Viewers</h4>
            <p className='text-xs text-gray-600'>Real-time viewer count</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
