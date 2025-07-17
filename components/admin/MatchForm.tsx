'use client'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import TeamField from '@/app/(admin)/admin/matches/new/TeamField'
import { useForm, Controller } from 'react-hook-form'
import { createMatchWithPlayers } from '@/lib/actions/matches.action'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Props = {
  teams: { id: string; name: string; value: string; avatar: string }[]
}

type MatchFormValues = {
  team1: string
  team2: string
  date: Date | undefined
}

export default function MatchForm({ teams }: Props) {
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<MatchFormValues>({
    defaultValues: {
      team1: '',
      team2: '',
      date: new Date(),
    },
  })
  const router = useRouter()

  const onSubmit = async (data: MatchFormValues) => {
    try {
      await createMatchWithPlayers({
        date: data.date!,
        team1Id: data.team1,
        team2Id: data.team2,
      })
      toast.success('Match created successfully!')
      router.push('/admin/matches')
    } catch {
      toast.error('Error creating match')
    }
  }

  return (
    <div className='max-w-xl mx-auto'>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div>
          <label className='block mb-1 font-medium'>Team 1</label>
          <Controller
            name='team1'
            control={control}
            rules={{ required: 'Team 1 is required' }}
            render={({ field }) => (
              <TeamField
                teams={teams}
                value={field.value}
                setValue={field.onChange}
                onTeamCreated={(team) => setValue('team1', team.value)}
              />
            )}
          />
          {errors.team1 && (
            <span className='text-red-500'>{errors.team1.message}</span>
          )}
        </div>
        <div>
          <label className='block mb-1 font-medium'>Team 2</label>
          <Controller
            name='team2'
            control={control}
            rules={{ required: 'Team 2 is required' }}
            render={({ field }) => (
              <TeamField
                teams={teams}
                value={field.value}
                setValue={field.onChange}
                onTeamCreated={(team) => setValue('team2', team.value)}
              />
            )}
          />
          {errors.team2 && (
            <span className='text-red-500'>{errors.team2.message}</span>
          )}
        </div>
        <div>
          <label className='block mb-1 font-medium'>Date</label>
          <Controller
            name='date'
            control={control}
            rules={{ required: 'Date is required' }}
            render={({ field }) => (
              <Calendar
                mode='single'
                defaultMonth={field.value}
                numberOfMonths={2}
                selected={field.value}
                onSelect={field.onChange}
                className='rounded-lg border shadow-sm w-full'
              />
            )}
          />
          {errors.date && (
            <span className='text-red-500'>{errors.date.message}</span>
          )}
        </div>
        <Button type='submit' className='w-full'>
          Create Match
        </Button>
      </form>
    </div>
  )
}
