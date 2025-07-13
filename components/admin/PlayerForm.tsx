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

// Tipos de entrada para el formulario de usuario
export type PlayerFormInputs = {
  name: string
  lastName: string
  age: number
  avatar?: string
  userId: string
  user: UserType
}

type Props = {
  player?: PlayerFormInputs & { id?: string }
  action?: 'create' | 'update'
  onSuccess?: () => void
}

export default function PlayerForm({
  player,
  action = 'create',
  onSuccess,
}: Props) {
  const defaultValues = {
    name: player?.name ?? '',
    lastName: player?.lastName ?? '',
    avatar: player?.avatar ?? '',
    age: player?.age ?? 0,
    userId: player?.userId ?? '',
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
      const result =
        action === 'create'
          ? await createPlayerAction(data)
          : await updatePlayerAction(player?.id ?? '', data)
      return {
        ...result,
        error: result.error ?? undefined,
        success: !result.error,
      }
    },
    defaultValues,
    redirectPath: '/admin/players',
  })

  // Llama onSuccess si el submit fue exitoso
  React.useEffect(() => {
    if (actionResult?.success && onSuccess) {
      onSuccess()
    }
  }, [actionResult, onSuccess])

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
        <input
          type='text'
          placeholder='Age'
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('age', { required: 'The age is required' })}
        />
        {errors?.age && <p className='text-red-500'>{errors.age.message}</p>}
      </div>
      <div>
        <label htmlFor='user' className='text-sm font-medium mb-2 block'>
          Parent
        </label>
        {action === 'create' ? (
          <UserSearch
            onSelect={(user) => {
              setValue('userId', user.id)
            }}
          />
        ) : (
          <p className='border-2 border-gray-300 rounded-md p-2 w-full'>
            {player?.user.name} {player?.user.lastName}
          </p>
        )}
      </div>
      <input
        type='hidden'
        {...register('userId', { required: 'The user is required' })}
      />
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
