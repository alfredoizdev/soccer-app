'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Player {
  id: string
  name: string
  lastName: string
  avatar?: string | null
  jerseyNumber?: number | null
  position?: string | null
  status?: string | null
  goals?: number
  assists?: number
  saves?: number
  goalsAllowed?: number
}

interface TeamsInfoProps {
  teamName: string
  teamAvatar: string
  players: Player[]
}

export default function TeamsInfo({
  teamName,
  teamAvatar,
  players,
}: TeamsInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Avatar className='w-6 h-6'>
            <AvatarImage src={teamAvatar || '/no-club.jpg'} alt={teamName} />
            <AvatarFallback>{teamName.charAt(0)}</AvatarFallback>
          </Avatar>
          {teamName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {players.map((player) => (
            <div
              key={player.id}
              className='flex items-center gap-3 p-2 rounded-lg bg-gray-50'
            >
              <Avatar className='w-8 h-8'>
                <AvatarImage
                  src={player.avatar || '/no-profile.webp'}
                  alt={`${player.name} ${player.lastName}`}
                />
                <AvatarFallback className='text-xs'>
                  {player.name[0]}
                  {player.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <div className='font-medium text-sm'>
                  {player.name} {player.lastName}
                </div>
                <div className='text-xs text-gray-500'>
                  #{player.jerseyNumber} • {player.position}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
