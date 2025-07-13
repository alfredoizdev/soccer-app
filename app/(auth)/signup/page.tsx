'use client'
import Link from 'next/link'
import useSubmitForm from '@/hooks/useSubmitForm'
import { createUserAction } from '@/lib/actions/auth.action'
import { toast } from 'sonner'
import ImageInput from '@/components/ui/ImageInput'
import React from 'react'

export default function Signup() {
  const {
    register,
    handleSubmit,
    handleFormSubmit,
    errors,
    isSubmitting,
    handleImageChange,
    handleClearImage,
    imagePreview,
  } = useSubmitForm<{
    email: string
    password: string
    name: string
    lastName: string
    avatar?: File | string
  }>({
    actionFn: async (data) => {
      const { success, error } = await createUserAction({
        ...data,
        avatar: data.avatar as string,
      })
      if (!success) {
        toast.error(error)
        return { error }
      }
      toast.success('User created successfully')
      return { success }
    },
    defaultValues: {
      email: '',
      password: '',
      name: '',
      lastName: '',
      avatar: undefined,
    },
    redirectPath: '/login',
  })

  return (
    <div className='flex flex-col items-center justify-center min-h-screen w-full p-4'>
      <h1 className='text-2xl font-bold mb-4'>Soccer Stats</h1>
      <div className='w-full max-w-md bg-white p-4 rounded-md shadow-md min-h-[300px] flex flex-col items-center justify-center'>
        <div className='w-full mb-2'>
          <h1 className='text-2xl font-bold mb-4'>Signup</h1>
        </div>
        <form
          noValidate
          className='flex flex-col items-center justify-center gap-2 w-full'
          onSubmit={handleSubmit(handleFormSubmit)}
        >
          <div className='w-full mb-2'>
            <ImageInput
              name='avatar'
              register={register}
              onChange={handleImageChange}
              className='border-2 border-gray-300 rounded-md p-2 w-full'
              previewUrl={imagePreview ?? undefined}
              onClearImage={handleClearImage}
            />
          </div>
          <div className='w-full mb-2'>
            <input
              type='email'
              placeholder='Email'
              className='border-2 border-gray-300 rounded-md p-2 w-full'
              {...register('email', {
                required: true,
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors?.email && (
              <p className='text-red-500'>{errors.email.message}</p>
            )}
          </div>
          <div className='w-full mb-2'>
            <input
              type='text'
              placeholder='Name'
              className='border-2 border-gray-300 rounded-md p-2 w-full'
              {...register('name', { required: true })}
            />
            {errors?.name && (
              <p className='text-red-500'>{errors.name.message}</p>
            )}
          </div>
          <div className='w-full mb-2'>
            <input
              type='text'
              placeholder='Last Name'
              className='border-2 border-gray-300 rounded-md p-2 w-full'
              {...register('lastName', { required: true })}
            />
            {errors?.lastName && (
              <p className='text-red-500'>{errors.lastName.message}</p>
            )}
          </div>
          <div className='w-full mb-2'>
            <input
              type='password'
              placeholder='Password'
              className='border-2 border-gray-300 rounded-md p-2 w-full'
              {...register('password', { required: true, minLength: 8 })}
            />
            {errors?.password && (
              <p className='text-red-500'>
                Password is required and must be at least 8 characters long
              </p>
            )}
          </div>
          <div className='w-full mb-2'>
            <p className='text-md text-gray-500 font-bold'>
              Already have an account?{' '}
              <Link href='/login' className='underline'>
                Login
              </Link>
            </p>
          </div>
          <button
            type='submit'
            className='bg-blue-500 text-white rounded-md p-2 w-full flex items-center justify-center gap-2'
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <svg
                className='animate-spin h-5 w-5 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                ></path>
              </svg>
            )}
            {isSubmitting ? 'Signing up...' : 'Signup'}
          </button>
        </form>
      </div>
    </div>
  )
}
