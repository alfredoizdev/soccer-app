'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import useSubmitForm from '@/hooks/useSubmitForm'
import ImageInput from '@/components/ui/ImageInput'
import React from 'react'
import {
  createPlayerAction,
  updatePlayerAction,
} from '@/lib/actions/player.action'
import UserSearch from './UserSearch'
import { UserType } from '@/types/UserType'
import { toast } from 'sonner'
import { RANGE_AGE, SOCCER_POSITIONS } from '@/lib/constants'

// Tipos de entrada para el formulario de usuario
export type PlayerFormInputs = {
  name: string
  lastName: string
  age: string | number
  avatar?: string
  userId: string
  user: UserType
  organizationId?: string // <-- Agregado
  position: string
}

type Props = {
  player?: PlayerFormInputs & { id?: string }
  action?: 'create' | 'update'
  onSuccess?: () => void
  fixedUserId?: string
  fixedUserName?: string
  fixedUserLastName?: string
  fixedOrganizationId?: string // <-- Agregado
  redirectPath?: string // <-- Agregado
}

export default function PlayerForm({
  player,
  action = 'create',
  onSuccess,
  fixedUserId,
  fixedUserName,
  fixedUserLastName,
  fixedOrganizationId, // <-- Agregado
  redirectPath, // <-- Agregado
}: Props) {
  const defaultValues = {
    name: player?.name ?? '',
    lastName: player?.lastName ?? '',
    avatar: player?.avatar ?? '',
    age: player?.age?.toString() ?? '',
    userId: fixedUserId ?? player?.userId ?? '',
    ...(fixedOrganizationId ? { organizationId: fixedOrganizationId } : {}), // <-- Solo si existe
    position: player?.position ?? '',
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
    actionResult,
    setValue,
  } = useSubmitForm<PlayerFormInputs>({
    actionFn: async (data) => {
      // Si no hay nueva imagen y hay una imagen anterior, usa la anterior
      if ((!data.avatar || data.avatar === '') && player?.avatar) {
        data.avatar = player.avatar
      }
      // Convertir age a number antes de enviar al backend
      const dataToSend = { ...data, age: Number(data.age) }
      const result =
        action === 'create'
          ? await createPlayerAction(dataToSend)
          : await updatePlayerAction(player?.id ?? '', dataToSend)
      return {
        ...result,
        error: result.error ?? undefined,
        success: !result.error,
      }
    },
    defaultValues,
    redirectPath: redirectPath ?? '/admin/players', // <-- Dinámico
  })

  // Llama onSuccess si el submit fue exitoso
  React.useEffect(() => {
    if (actionResult?.success && onSuccess) {
      onSuccess()
    }
    if (actionResult?.error) {
      toast.error(actionResult.error)
    }
  }, [actionResult, onSuccess])

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className='space-y-4 w-full max-w-md px-4'
    >
      <div className='min-w-[300px]'>
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
        <input
          type='text'
          placeholder='Name'
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('name', { required: 'The name is required' })}
        />
        {errors?.name && <p className='text-red-500'>{errors.name.message}</p>}
      </div>
      <div>
        <input
          type='text'
          placeholder='Last Name'
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('lastName', { required: 'The last name is required' })}
        />
        {errors?.lastName && (
          <p className='text-red-500'>{errors.lastName.message}</p>
        )}
      </div>
      <div>
        <select
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('position', { required: 'The position is required' })}
        >
          <option value=''>Select position</option>
          {SOCCER_POSITIONS.map((pos) => (
            <option key={pos.value} value={pos.value}>
              {pos.label}
            </option>
          ))}
        </select>
        {errors?.position && (
          <p className='text-red-500'>{errors.position.message}</p>
        )}
      </div>
      <div>
        <select
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('age', {
            required: 'The age is required',
            min: 5,
            max: 45,
          })}
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
        <label htmlFor='user' className='text-sm font-medium mb-2 block'>
          Parent
        </label>
        {fixedUserId ? (
          <p className='border-2 border-gray-300 rounded-md p-2 w-full bg-gray-50'>
            You {fixedUserName} {fixedUserLastName}
          </p>
        ) : action === 'create' ? (
          <UserSearch
            onSelect={(user) => {
              setValue('userId', user.id)
            }}
          />
        ) : (
          <p className='border-2 border-gray-300 rounded-md p-2 w-full'>
            {player?.user
              ? `${player.user.name} ${player.user.lastName}`
              : 'No parent assigned'}
          </p>
        )}
      </div>
      <input
        type='hidden'
        {...register('userId', { required: 'The user is required' })}
      />
      {/* Campo oculto para organizationId solo si existe */}
      {fixedOrganizationId && (
        <input
          type='hidden'
          {...register('organizationId', {
            required: 'The organization is required',
          })}
        />
      )}
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
