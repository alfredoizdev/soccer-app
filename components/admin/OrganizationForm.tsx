'use client'

import { Button } from '@/components/ui/button'

import { Loader2 } from 'lucide-react'

import useSubmitForm from '@/hooks/useSubmitForm'
import { createOrganizationAction } from '@/lib/actions/organization.action'
import ImageInput from '@/components/ui/ImageInput'

type OrganizationFormInputs = {
  name: string
  description: string
  avatar?: string
}

export default function OrganizationForm() {
  const defaultValues = {
    name: '',
    description: '',
    avatar: '',
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
  } = useSubmitForm<OrganizationFormInputs>({
    actionFn: async (data) => {
      const result = await createOrganizationAction(data)
      return {
        ...result,
        error: result.error ?? undefined,
      }
    },
    defaultValues,
    redirectPath: '/admin/teams',
  })

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className='space-y-4 w-full max-w-md bg-white p-6 rounded-md shadow-md'
    >
      <div>
        <ImageInput
          name='avatar'
          register={register}
          onChange={handleImageChange}
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          previewUrl={imagePreview ?? undefined}
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
        {isSubmitting ? 'Adding Team...' : 'Add Team'}
        {isSubmitting && <Loader2 className='w-4 h-4 ml-2 animate-spin' />}
      </Button>
    </form>
  )
}
