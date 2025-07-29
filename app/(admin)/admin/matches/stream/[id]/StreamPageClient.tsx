'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Video, Mic, Users } from 'lucide-react'
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
  return (
    <div className='w-full mx-auto animate-fade-in duration-500'>
      {/* Header con navegación */}
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
          <Video className='w-5 h-5 text-red-500' />
          <span className='text-sm font-medium text-gray-600'>Live Stream</span>
        </div>
      </div>

      {/* Título del partido */}
      <div className='text-center mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold mb-2'>{matchTitle}</h1>
        <p className='text-gray-600'>Live streaming session</p>
      </div>

      {/* Información del partido */}
      <Card className='p-6 mb-8'>
        <div className='flex items-center justify-center gap-8 mb-4'>
          <div className='text-center'>
            <Avatar className='w-16 h-16 mx-auto mb-2'>
              <AvatarImage src={team1Avatar} alt={team1} />
              <AvatarFallback className='text-lg'>{team1[0]}</AvatarFallback>
            </Avatar>
            <h3 className='font-semibold'>{team1}</h3>
          </div>

          <div className='text-center'>
            <div className='text-3xl font-bold text-gray-400'>VS</div>
            <div className='text-sm text-gray-500'>Live Match</div>
          </div>

          <div className='text-center'>
            <Avatar className='w-16 h-16 mx-auto mb-2'>
              <AvatarImage src={team2Avatar} alt={team2} />
              <AvatarFallback className='text-lg'>{team2[0]}</AvatarFallback>
            </Avatar>
            <h3 className='font-semibold'>{team2}</h3>
          </div>
        </div>

        <div className='text-center'>
          <p className='text-sm text-gray-600 mb-2'>
            Stream this match live to your audience
          </p>
          <div className='flex items-center justify-center gap-2 text-sm text-gray-500'>
            <Video className='w-4 h-4' />
            <span>Professional streaming with WebRTC technology</span>
          </div>
        </div>
      </Card>

      {/* Componente de streaming */}
      <div className='max-w-4xl mx-auto'>
        <StreamBroadcaster matchId={matchId} matchTitle={matchTitle} />
      </div>

      {/* Información adicional */}
      <Card className='p-6 mt-8'>
        <h3 className='text-lg font-semibold mb-4'>Streaming Features</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='text-center p-4 bg-gray-50 rounded-lg'>
            <Video className='w-8 h-8 mx-auto mb-2 text-blue-500' />
            <h4 className='font-medium mb-1'>High Quality Video</h4>
            <p className='text-sm text-gray-600'>
              Crystal clear video streaming
            </p>
          </div>
          <div className='text-center p-4 bg-gray-50 rounded-lg'>
            <Mic className='w-8 h-8 mx-auto mb-2 text-green-500' />
            <h4 className='font-medium mb-1'>Audio Control</h4>
            <p className='text-sm text-gray-600'>Mute/unmute audio as needed</p>
          </div>
          <div className='text-center p-4 bg-gray-50 rounded-lg'>
            <Users className='w-8 h-8 mx-auto mb-2 text-purple-500' />
            <h4 className='font-medium mb-1'>Live Viewers</h4>
            <p className='text-sm text-gray-600'>Real-time viewer count</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
