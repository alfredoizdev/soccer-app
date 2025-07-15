'use client'
import React, { useState } from 'react'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer'
import { PlayerMatchWithStats } from '@/lib/actions/matches.action'
import { getOrganizationAction } from '@/lib/actions/organization.action'
import PlayerMatchCard from './PlayerMatchCard'

interface PlayerMatchesDrawerProps {
  matches: PlayerMatchWithStats[]
  trigger?: React.ReactNode
}

export default function PlayerMatchesDrawer({
  matches,
  trigger,
}: PlayerMatchesDrawerProps) {
  const [teams, setTeams] = useState<
    Record<string, { name: string; avatar: string }>
  >({})
  const [loading, setLoading] = useState(false)

  // Fetch teams only once when opening the drawer
  const fetchTeams = async () => {
    if (Object.keys(teams).length > 0 || loading) return
    setLoading(true)
    const uniqueTeamIds = Array.from(
      new Set(matches.flatMap((m) => [m.match.team1Id, m.match.team2Id]))
    )
    const teamData: Record<string, { name: string; avatar: string }> = {}
    await Promise.all(
      uniqueTeamIds.map(async (id) => {
        const res = await getOrganizationAction(id)
        if (res?.data) {
          teamData[id] = {
            name: res.data.name,
            avatar: res.data.avatar || '/no-profile.webp',
          }
        }
      })
    )
    setTeams(teamData)
    setLoading(false)
  }

  return (
    <Drawer onOpenChange={(open) => open && fetchTeams()} direction='right'>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Matches played</DrawerTitle>
          <DrawerClose asChild>
            <button className='absolute right-4 top-4 text-gray-500 hover:text-gray-700'>
              Close
            </button>
          </DrawerClose>
        </DrawerHeader>
        <div className='p-4 max-h-[60vh] overflow-y-auto'>
          {matches.map(({ match, stats, player }) => (
            <PlayerMatchCard
              key={match.id}
              team1={{
                ...(teams[match.team1Id] || {
                  name: '',
                  avatar: '/no-profile.webp',
                }),
                goals: match.team1Goals,
              }}
              team2={{
                ...(teams[match.team2Id] || {
                  name: '',
                  avatar: '/no-profile.webp',
                }),
                goals: match.team2Goals,
              }}
              stats={{
                ...stats,
                jerseyNumber: player.jerseyNumber ?? undefined,
              }}
              date={match.date}
            />
          ))}
          {matches.length === 0 && <div>No matches found.</div>}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
