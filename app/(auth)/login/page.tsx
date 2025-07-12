'use client'
import { loginAction } from '@/lib/actions/auth.action'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'

type LoginForm = {
  email: string
  password: string
}

export default function Login() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    try {
      const { success, error } = await loginAction(data.email, data.password)
      if (!success) {
        toast.error(error)
        return
      }
      toast.success('Logged in successfully')
      router.push('/members/home')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Error logging in')
      }
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen w-full p-4'>
      <h1 className='text-2xl font-bold mb-4'>Soccer Stats</h1>
      <div className='w-full max-w-md bg-white p-4 rounded-md shadow-md min-h-[300px] flex flex-col items-center justify-center'>
        <div className='w-full mb-2'>
          <h1 className='text-2xl font-bold mb-4'>Login</h1>
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
              Don&apos;t have an account?{' '}
              <Link href='/signup' className='underline'>
                Sign up
              </Link>
            </p>
          </div>
          <button
            type='submit'
            className='bg-blue-500 text-white rounded-md p-2 w-full'
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
