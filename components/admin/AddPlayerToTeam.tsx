'use client'
import { useState, useEffect } from 'react'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer'
import { getAvailablePlayersForOrganization } from '@/lib/actions/player.action'
import { addPlayerToOrganizationAction } from '@/lib/actions/player.action'
import { PlayerType } from '@/types/PlayerType'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AddPlayerToTeamProps {
  organizationId: string
}

export default function AddPlayerToTeam({
  organizationId,
}: AddPlayerToTeamProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<PlayerType[]>([])
  const [loading, setLoading] = useState(false)
  const [allPlayers, setAllPlayers] = useState<PlayerType[]>([])

  useEffect(() => {
    if (open) {
      setLoading(true)
      getAvailablePlayersForOrganization().then((res) => {
        setAllPlayers(res.data || [])
        setResults(res.data || [])
        setLoading(false)
      })
    } else {
      setSearch('')
      setResults([])
      setAllPlayers([])
    }
  }, [open])

  const handleSearch = (value: string) => {
    setSearch(value)
    if (value.length < 2) {
      setResults(allPlayers)
      return
    }
    const filtered = allPlayers.filter(
      (p) =>
        p.name.toLowerCase().includes(value.toLowerCase()) ||
        p.lastName.toLowerCase().includes(value.toLowerCase())
    )
    setResults(filtered)
  }

  const handleSelect = async (player: PlayerType) => {
    const res = await addPlayerToOrganizationAction(player.id, organizationId)
    if (res.success) {
      toast.success('Player added to team!')
    } else {
      toast.error(res.error || 'Error adding player to team')
    }
    setOpen(false)
    setSearch('')
    setResults([])
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction='right'>
      <DrawerTrigger asChild>
        <button className='px-4 py-2 bg-gray-800 text-white rounded-md shadow hover:bg-gray-700 transition-colors text-sm font-semibold'>
          Add Player
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add Player to Team</DrawerTitle>
        </DrawerHeader>
        <div className='p-4'>
          <input
            type='text'
            placeholder='Search player by name...'
            className='border-2 border-gray-300 rounded-md p-2 w-full'
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            autoComplete='off'
          />
          {loading && search.length >= 2 && (
            <Loader2 className='absolute right-6 top-7 w-5 h-5 text-gray-400 animate-spin' />
          )}
          {results.length > 0 && (
            <ul className='mt-2 max-h-64 overflow-y-auto bg-white'>
              {results.map((player, idx) => (
                <li
                  key={player.id}
                  className={`flex items-center gap-4 px-4 py-2 hover:bg-gray-100 cursor-pointer${
                    idx !== results.length - 1
                      ? ' border-b border-gray-200'
                      : ''
                  }`}
                  onClick={() => handleSelect(player)}
                >
                  <Avatar className='w-9 h-9'>
                    <AvatarImage
                      className='object-cover'
                      src={player.avatar ?? ''}
                      alt={player.name}
                    />
                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col'>
                    <span className='font-medium'>
                      {player.name} {player.lastName}
                    </span>
                    <span className='text-xs text-gray-500'>
                      Age: {player.age}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!loading && search.length >= 2 && results.length === 0 && (
            <div className='mt-2 text-gray-500'>No players found</div>
          )}
        </div>
        <DrawerClose asChild>
          <button className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'>
            ×
          </button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  )
}
