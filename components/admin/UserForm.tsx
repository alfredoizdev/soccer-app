'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import useSubmitForm from '@/hooks/useSubmitForm'
import { createUserAction } from '@/lib/actions/users.action'
import { updateUserAction } from '@/lib/actions/users.action'
import ImageInput from '@/components/ui/ImageInput'
import { USER_ROLES } from '@/lib/constants'
import React from 'react'

// Tipos de entrada para el formulario de usuario
export type UserFormInputs = {
  name: string
  lastName: string
  email: string
  password: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
  avatar?: string
}

type Props = {
  user?: UserFormInputs & { id?: string }
  action?: 'create' | 'update'
  onSuccess?: () => void
  redirectPath?: string
}

export default function UserForm({
  user,
  action = 'create',
  onSuccess,
  redirectPath,
}: Props) {
  const defaultValues = {
    name: user?.name ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    password: '',
    role: user?.role ?? 'user',
    status: user?.status ?? 'active',
    avatar: user?.avatar ?? '',
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
  } = useSubmitForm<UserFormInputs>({
    actionFn: async (data) => {
      // Si no hay nueva imagen y hay una imagen anterior, usa la anterior
      if ((!data.avatar || data.avatar === '') && user?.avatar) {
        data.avatar = user.avatar
      }
      const result =
        action === 'create'
          ? await createUserAction(data)
          : await updateUserAction(
              user?.id ?? '',
              data,
              typeof window !== 'undefined'
                ? window.location.pathname
                : undefined
            )
      return {
        ...result,
        error: result.error ?? undefined,
        success: !result.error,
      }
    },
    defaultValues,
    redirectPath,
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
          previewUrl={imagePreview ?? user?.avatar ?? undefined}
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
          type='email'
          placeholder='Email (example@example.com)'
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('email', { required: 'The email is required' })}
        />
        {errors?.email && (
          <p className='text-red-500'>{errors.email.message}</p>
        )}
      </div>
      <div>
        {action === 'create' && (
          <>
            <input
              type='password'
              placeholder='Password'
              className='border-2 border-gray-300 rounded-md p-2 w-full'
              {...register('password', {
                required: 'The password is required',
              })}
            />
            {errors?.password && (
              <p className='text-red-500'>{errors.password.message}</p>
            )}
          </>
        )}
      </div>
      <div>
        <select
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('role', { required: 'The role is required' })}
        >
          {USER_ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        {errors?.role && <p className='text-red-500'>{errors.role.message}</p>}
      </div>
      <div>
        <select
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('status', { required: 'The status is required' })}
        >
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
        </select>
        {errors?.status && (
          <p className='text-red-500'>{errors.status.message}</p>
        )}
      </div>
      <Button type='submit' className='w-full' disabled={isSubmitting}>
        {isSubmitting
          ? action === 'create'
            ? 'Adding User...'
            : 'Updating User...'
          : action === 'create'
          ? 'Add User'
          : 'Update User'}
        {isSubmitting && <Loader2 className='w-4 h-4 ml-2 animate-spin' />}
      </Button>
    </form>
  )
}
