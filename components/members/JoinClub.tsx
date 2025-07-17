'use client'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'
import { OrganizationType } from '@/types/UserType'
import { unregisterOrganizationAction } from '@/lib/actions/organization.action'
import { joinOrganizationAction } from '@/lib/actions/organization.action'
import { toast } from 'sonner'

export default function JoinClub({
  clubs,
  userId,
  organizationId,
}: {
  clubs: OrganizationType[]
  userId?: string
  organizationId?: string
}) {
  const [joinedClubId, setJoinedClubId] = useState<string | null>(
    organizationId ?? null
  )
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Detectar club actual del usuario
  const currentClub = clubs.find((club) => club.id === joinedClubId)

  // Si el usuario ya está registrado en un club, mostrarlo destacado
  if (joinedClubId && currentClub) {
    return (
      <div className='max-w-2xl mx-auto py-8 px-4'>
        <div className='mb-6 text-center'>
          <h2 className='text-2xl font-bold mb-2'>Your Club</h2>
          <p className='text-gray-600'>
            You are currently registered in this club. You can unregister if you
            want to join another club.
          </p>
        </div>
        <div className='flex flex-col items-center bg-white rounded-xl shadow p-6 mb-8'>
          <Image
            src={currentClub.avatar || '/no-club.jpg'}
            width={64}
            height={64}
            alt={currentClub.name}
            className='w-16 h-16 rounded-full object-cover mb-3 border'
          />

          <h3 className='text-lg font-semibold mb-1'>{currentClub.name}</h3>
          <p className='text-gray-500 text-sm mb-4 text-center'>
            {currentClub.description}
          </p>
          <Button
            variant='destructive'
            onClick={async () => {
              setLoadingId(currentClub.id)
              if (userId) {
                await unregisterOrganizationAction(userId)
                setJoinedClubId(null)
              }
              setLoadingId(null)
            }}
            disabled={loadingId === currentClub.id}
            className='w-full flex items-center gap-2'
          >
            {loadingId === currentClub.id ? 'Unregistering...' : 'Unregister'}
          </Button>
        </div>
      </div>
    )
  }

  // Si no hay clubs disponibles
  if (!clubs || clubs.length === 0)
    return (
      <div className='flex justify-center items-center h-screen'>
        <p className='text-gray-500'>No clubs found</p>
      </div>
    )

  // Mostrar lista de clubs para unirse
  return (
    <div className='max-w-2xl mx-auto py-8 px-4'>
      <div className='mb-6 text-center'>
        <h2 className='text-2xl font-bold mb-2'>Join a Club</h2>
        <p className='text-gray-600'>
          To participate in events and register your players, you must first
          join a club. Select your club below and become part of the community!
        </p>
      </div>
      <div className='grid gap-6 sm:grid-cols-2'>
        {clubs.map((club) => (
          <div
            key={club.id}
            className={`bg-white rounded-xl shadow p-6 flex flex-col items-center transition-all ${
              joinedClubId === club.id ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <Image
              src={club?.avatar || '/no-club.jpg'}
              width={64}
              height={64}
              alt={club.name}
              className='w-16 h-16 rounded-full object-cover mb-3 border'
            />

            <h3 className='text-lg font-semibold mb-1'>{club.name}</h3>
            <p className='text-gray-500 text-sm mb-4 text-center'>
              {club.description}
            </p>
            <Button
              onClick={async () => {
                setLoadingId(club.id)
                if (userId) {
                  const res = await joinOrganizationAction(userId, club.id)
                  if (res.success) {
                    setJoinedClubId(club.id)
                    toast.success('You have joined the club!')
                  } else {
                    toast.error(res.error || 'Failed to join club')
                  }
                }
                setLoadingId(null)
              }}
              disabled={joinedClubId === club.id || loadingId === club.id}
              className='w-full flex items-center gap-2'
            >
              {joinedClubId === club.id
                ? 'Joined'
                : loadingId === club.id
                ? 'Joining...'
                : 'Join Club'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
