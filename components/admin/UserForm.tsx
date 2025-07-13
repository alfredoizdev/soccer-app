'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import useSubmitForm from '@/hooks/useSubmitForm'
import { createUserAction } from '@/lib/actions/users.action'
import ImageInput from '@/components/ui/ImageInput'
import { USER_ROLES } from '@/lib/constants'

// Tipos de entrada para el formulario de usuario
export type UserFormInputs = {
  name: string
  lastName: string
  email: string
  password: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
  age: number
  avatar?: string
}

export default function UserForm() {
  const defaultValues = {
    name: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
    age: 0,
    avatar: '',
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
  } = useSubmitForm<UserFormInputs>({
    actionFn: async (data) => {
      const result = await createUserAction(data)
      return {
        ...result,
        error: result.error ?? undefined,
        success: !result.error,
      }
    },
    defaultValues,
    redirectPath: '/admin/users',
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
      <div>
        <input
          type='number'
          placeholder='Age'
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('age', {
            required: 'The age is required',
            valueAsNumber: true,
            min: {
              value: 0,
              message: 'The age must be greater than or equal to 0',
            },
          })}
        />
        {errors?.age && <p className='text-red-500'>{errors.age.message}</p>}
      </div>
      <Button type='submit' className='w-full' disabled={isSubmitting}>
        {isSubmitting ? 'Adding User...' : 'Add User'}
        {isSubmitting && <Loader2 className='w-4 h-4 ml-2 animate-spin' />}
      </Button>
    </form>
  )
}
