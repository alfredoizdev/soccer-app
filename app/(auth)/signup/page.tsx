'use client'
import Link from 'next/link'
import { SubmitHandler, useForm } from 'react-hook-form'
import { signupAction } from '@/lib/actions/auth.action'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type SignupForm = {
  email: string
  password: string
  name: string
  lastName: string
  age: number
}

export default function Signup() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      name: '',
      lastName: '',
      age: 0,
    },
  })

  const onSubmit: SubmitHandler<SignupForm> = async (data) => {
    try {
      const { success, error } = await signupAction(data)
      if (!success) {
        toast.error(error)
        return
      }
      toast.success('User created successfully')
      router.push('/login')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Error creating user')
      }
    }
  }

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
          onSubmit={handleSubmit(onSubmit)}
        >
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
            {errors.email && (
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
            {errors.name && (
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
            {errors.lastName && (
              <p className='text-red-500'>{errors.lastName.message}</p>
            )}
          </div>
          <div className='w-full mb-2'>
            <input
              type='number'
              placeholder='Age'
              className='border-2 border-gray-300 rounded-md p-2 w-full'
              {...register('age', { required: true, min: 18 })}
            />
            {errors.age && <p className='text-red-500'>{errors.age.message}</p>}
          </div>
          <div className='w-full mb-2'>
            <input
              type='password'
              placeholder='Password'
              className='border-2 border-gray-300 rounded-md p-2 w-full'
              {...register('password', { required: true, minLength: 8 })}
            />
            {errors.password && (
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
            className='bg-blue-500 text-white rounded-md p-2 w-full'
          >
            Signup
          </button>
        </form>
      </div>
    </div>
  )
}
