import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ChevronsUpDown } from 'lucide-react'
import { Command, CommandEmpty } from '@/components/ui/command'
import { CommandInput } from '@/components/ui/command'
import { CommandList } from '@/components/ui/command'
import { CommandGroup } from '@/components/ui/command'
import { CommandItem } from '@/components/ui/command'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import React from 'react'
import CreateTeamDrawer from './CreateTeamDrawer'
import Image from 'next/image'

export default function TeamField({
  teams,
  value,
  setValue,
  onTeamCreated,
  disabledTeams = [],
}: {
  teams: { id: string; name: string; value: string; avatar: string }[]
  value: string
  setValue: (value: string) => void
  onTeamCreated: (team: { id: string; name: string; value: string }) => void
  disabledTeams?: string[]
}) {
  const [open, setOpen] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='justify-between min-w-[200px]'
          >
            {value
              ? teams.find((team) => team.value === value)?.name
              : 'Select team...'}
            <ChevronsUpDown className='opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0 rounded-none'>
          <Command>
            <CommandInput placeholder='Search team...' className='h-9' />
            <CommandList>
              <CommandEmpty>No team found.</CommandEmpty>
              <CommandGroup>
                {teams.map((team) => {
                  const isDisabled = disabledTeams.includes(team.value)
                  return (
                    <CommandItem
                      key={team.value}
                      value={team.value}
                      disabled={isDisabled}
                      onSelect={(currentValue) => {
                        if (!isDisabled) {
                          setValue(currentValue === value ? '' : currentValue)
                          setOpen(false)
                        }
                      }}
                      className={cn(
                        isDisabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span className='mr-2'>
                        <Image
                          src={team.avatar || '/no-club.jpg'}
                          alt={team.name}
                          width={20}
                          height={20}
                          className='w-6 h-6 rounded-full inline-block object-cover'
                        />
                      </span>

                      {team.name}
                      <Check
                        className={cn(
                          'ml-auto',
                          value === team.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              {/* Botón siempre visible al final */}
              <div className='p-2 border-t'>
                <Button
                  variant='default'
                  className='w-full'
                  onClick={() => setDrawerOpen(true)}
                >
                  Other / Not registered
                </Button>
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <CreateTeamDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onTeamCreated={onTeamCreated}
      />
    </>
  )
}
