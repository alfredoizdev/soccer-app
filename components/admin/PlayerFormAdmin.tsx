'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import useSubmitForm from '@/hooks/useSubmitForm'
import ImageInput from '@/components/ui/ImageInput'
import React from 'react'
import {
  updatePlayerAction,
  adminCreatePlayerAction,
  checkJerseyNumberAvailabilityAction,
} from '@/lib/actions/player.action'
import UserSearch from './UserSearch'
import { toast } from 'sonner'
import ClubSearch from './ClubSearch'
import { RANGE_AGE, SOCCER_POSITIONS } from '@/lib/constants'
import { useGlobalStore } from '@/lib/stores/globalStore'

// Tipos de entrada para el formulario de usuario
export type PlayerFormAdminInputs = {
  name: string
  lastName: string
  age: string | number
  avatar?: string
  userId: string
  organizationId?: string | null
  position: string
  jerseyNumber?: string
  user?: {
    id: string
    name: string
    lastName: string
  }
}

interface Props {
  player?: PlayerFormAdminInputs & { id?: string }
  action?: 'create' | 'update'
  onSuccess?: () => void
  fixedUserId?: string
  fixedUserName?: string
  fixedUserLastName?: string
  redirectPath?: string
}

export default function PlayerFormAdmin({
  player,
  action = 'create',
  onSuccess,
  fixedUserId,
  fixedUserName,
  fixedUserLastName,
  redirectPath,
}: Props) {
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  )

  const defaultValues = {
    name: player?.name ?? '',
    lastName: player?.lastName ?? '',
    avatar: player?.avatar ?? '',
    age: player?.age?.toString() ?? '',
    userId: fixedUserId ?? player?.userId ?? '',
    organizationId: player?.organizationId ?? '',
    position: player?.position ?? '',
    jerseyNumber: player?.jerseyNumber?.toString() ?? '',
  } as const

  const {
    register,
    handleSubmit,
    errors,
    handleFormSubmit,
    handleImageChange,
    handleClearImage,
    isSubmitting,
    imagePreview,
    setValue,
    watch,
    actionResult,
  } = useSubmitForm<PlayerFormAdminInputs>({
    actionFn: async (data) => {
      setValidationError(null) // Limpiar errores anteriores

      if ((!data.avatar || data.avatar === '') && player?.avatar) {
        data.avatar = player.avatar
      }

      // Si organizationId es string vacío, ponerlo en null
      if (data.organizationId === '') {
        data.organizationId = null
      }

      // Validar número de jersey si se proporciona
      if (data.jerseyNumber) {
        const jerseyNumber = Number(data.jerseyNumber)
        if (isNaN(jerseyNumber) || jerseyNumber < 1 || jerseyNumber > 99) {
          setValidationError('Jersey number must be between 1 and 99')
          return {
            success: false,
            error: 'Jersey number must be between 1 and 99',
          }
        }

        // Solo verificar disponibilidad si el jugador está asignado a un equipo
        if (data.organizationId) {
          const availability = await checkJerseyNumberAvailabilityAction(
            jerseyNumber,
            data.organizationId,
            player?.id
          )

          if (!availability.isAvailable) {
            setValidationError(
              `Jersey number ${jerseyNumber} is already taken in this team`
            )
            return {
              success: false,
              error: `Jersey number ${jerseyNumber} is already taken in this team`,
            }
          }
        }
      }

      const dataToSend = {
        ...data,
        age: Number(data.age),
        jerseyNumber: data.jerseyNumber ? Number(data.jerseyNumber) : null,
      }

      let result
      if (action === 'create') {
        result = await adminCreatePlayerAction(dataToSend)
      } else {
        result = await updatePlayerAction(player?.id || '', dataToSend)
      }

      // Normalizar la respuesta para que coincida con el tipo esperado
      return {
        success: !result.error,
        error: result.error || undefined,
      }
    },
    defaultValues,
    redirectPath: redirectPath ?? '/admin/players',
  })

  // Manejar el éxito del formulario
  React.useEffect(() => {
    if (actionResult?.success) {
      toast.success(
        action === 'create'
          ? 'Player created successfully!'
          : 'Player updated successfully!'
      )
      if (onSuccess) {
        onSuccess()
      }
    } else if (actionResult?.error) {
      toast.error(actionResult.error)
    }
  }, [actionResult, action, onSuccess])

  const selectedClub = watch('organizationId')
  const { organizationsLoaded, loadOrganizations } = useGlobalStore()

  React.useEffect(() => {
    if (!organizationsLoaded) {
      loadOrganizations()
    }
  }, [organizationsLoaded, loadOrganizations])

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className='space-y-4 w-full max-w-md px-4'
    >
      <div>
        <ImageInput
          name='avatar'
          register={register}
          onChange={handleImageChange}
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          previewUrl={imagePreview ?? player?.avatar ?? undefined}
          onClearImage={handleClearImage}
        />
      </div>
      <div>
        <label htmlFor='name' className='text-sm font-medium mb-2 block'>
          Name
        </label>
        <input
          type='text'
          id='name'
          placeholder='Name'
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('name', { required: 'The name is required' })}
        />
        {errors?.name && <p className='text-red-500'>{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor='lastName' className='text-sm font-medium mb-2 block'>
          Last Name
        </label>
        <input
          type='text'
          id='lastName'
          placeholder='Last Name'
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('lastName', { required: 'The last name is required' })}
        />
        {errors?.lastName && (
          <p className='text-red-500'>{errors.lastName.message}</p>
        )}
      </div>
      <div>
        <label htmlFor='position' className='text-sm font-medium mb-2 block'>
          Position
        </label>
        <select
          id='position'
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('position', { required: 'The position is required' })}
        >
          <option value=''>Select position</option>
          {SOCCER_POSITIONS.map((position) => (
            <option key={position.value} value={position.value}>
              {position.label}
            </option>
          ))}
        </select>
        {errors?.position && (
          <p className='text-red-500'>{errors.position.message}</p>
        )}
      </div>
      <div>
        <label htmlFor='age' className='text-sm font-medium mb-2 block'>
          Age
        </label>
        <select
          id='age'
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('age', { required: 'The age is required' })}
        >
          <option value=''>Select age</option>
          {RANGE_AGE.map((age) => (
            <option key={age} value={age}>
              {age}
            </option>
          ))}
        </select>
        {errors?.age && <p className='text-red-500'>{errors.age.message}</p>}
      </div>
      <div>
        <label
          htmlFor='jerseyNumber'
          className='text-sm font-medium mb-2 block'
        >
          Jersey Number
        </label>
        <input
          type='number'
          id='jerseyNumber'
          placeholder='Jersey Number (1-99)'
          min='1'
          max='99'
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('jerseyNumber', {
            min: {
              value: 1,
              message: 'Jersey number must be at least 1',
            },
            max: {
              value: 99,
              message: 'Jersey number must be at most 99',
            },
          })}
        />
        {errors?.jerseyNumber && (
          <p className='text-red-500'>{errors.jerseyNumber.message}</p>
        )}
        {validationError && <p className='text-red-500'>{validationError}</p>}
        <p className='text-xs text-gray-500 mt-1'>
          Enter a number between 1 and 99.
        </p>
      </div>
      <div>
        <label htmlFor='user' className='text-sm font-medium mb-2 block'>
          Parent
        </label>
        {fixedUserId ? (
          <p className='border-2 border-gray-300 rounded-md p-2 w-full bg-gray-50'>
            {fixedUserName} {fixedUserLastName}
          </p>
        ) : (
          <UserSearch
            key={player?.id || 'no-user'}
            onSelect={(user) => {
              setValue('userId', user.id, { shouldValidate: true })
            }}
            defaultUser={
              player?.user
                ? {
                    id: player.user.id,
                    name: player.user.name,
                    lastName: player.user.lastName,
                    email: '',
                    role: 'user',
                    avatar: '',
                    organizationId: undefined,
                    password: '',
                    status: 'active',
                  }
                : undefined
            }
          />
        )}
        {errors?.userId && (
          <p className='text-red-500'>{errors.userId.message}</p>
        )}
      </div>
      <div>
        <label htmlFor='club' className='text-sm font-medium mb-2 block'>
          Club
        </label>
        <ClubSearch
          onSelect={(club) => {
            setValue('organizationId', club.id, { shouldValidate: true })
          }}
          selectedClubId={selectedClub || undefined}
        />
        {errors?.organizationId && (
          <p className='text-red-500'>{errors.organizationId.message}</p>
        )}
      </div>
      <Button type='submit' className='w-full' disabled={isSubmitting}>
        {isSubmitting
          ? action === 'create'
            ? 'Adding Player...'
            : 'Updating Player...'
          : action === 'create'
          ? 'Add Player'
          : 'Update Player'}
        {isSubmitting && <Loader2 className='w-4 h-4 ml-2 animate-spin' />}
      </Button>
    </form>
  )
}
