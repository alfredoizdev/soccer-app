'use client'

import { Button } from '@/components/ui/button'

import { Loader2 } from 'lucide-react'

import useSubmitForm from '@/hooks/useSubmitForm'
import {
  createOrganizationAction,
  updateOrganizationAction,
} from '@/lib/actions/organization.action'
import ImageInput from '@/components/ui/ImageInput'
import { TeamType } from '@/types/TeamType'
import * as React from 'react'

type OrganizationFormInputs = {
  name: string
  description: string
  avatar?: string
}

type Props = {
  team?: TeamType
  onSuccess?: () => void
  redirectPath?: string
  action?: 'create' | 'update'
}

export default function OrganizationForm({
  team,
  onSuccess,
  action,
  redirectPath,
}: Props) {
  const defaultValues = {
    name: team?.name ?? '',
    description: team?.description ?? '',
    avatar: team?.avatar ?? '',
  }

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
  } = useSubmitForm<OrganizationFormInputs>({
    actionFn: async (data) => {
      // Si no hay nueva imagen y hay una imagen anterior, usa la anterior
      if ((!data.avatar || data.avatar === '') && team?.avatar) {
        data.avatar = team.avatar
      }
      const result =
        action === 'create'
          ? await createOrganizationAction(data)
          : await updateOrganizationAction(team?.id ?? '', data)
      return {
        ...result,
        error: result.error ?? undefined,
      }
    },
    defaultValues,
    redirectPath: redirectPath || '/admin/teams',
  })

  // Efecto para llamar onSuccess si el submit fue exitoso
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
          previewUrl={imagePreview ?? team?.avatar ?? undefined}
          onClearImage={handleClearImage}
        />
      </div>
      <div>
        <input
          type='text'
          placeholder='Team Name'
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('name', { required: 'Team Name is required' })}
        />
        {errors?.name && <p className='text-red-500'>{errors.name.message}</p>}
      </div>
      <div>
        <textarea
          placeholder='Team Description (optional)'
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('description', {
            required: 'Team Description is required',
          })}
        />
        {errors?.description && (
          <p className='text-red-500'>{errors.description.message}</p>
        )}
      </div>
      <Button type='submit' className='w-full' disabled={isSubmitting}>
        {isSubmitting
          ? `Updating Team...`
          : action === 'create'
          ? 'Add Team'
          : 'Update Team'}
        {isSubmitting && <Loader2 className='w-4 h-4 ml-2 animate-spin' />}
      </Button>
    </form>
  )
}
