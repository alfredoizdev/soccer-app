'use server'
import { dbPromise } from '@/database/drizzle'
import { usersTable } from '@/database/schema'
import { UserType } from '@/types/UserType'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const createUserAction = async (
  user: Omit<UserType, 'id' | 'createdAt' | 'updatedAt' | 'role' | 'status'>
) => {
  try {
    const db = await dbPromise

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, user.email))
      .limit(1)

    if (existingUser.length > 0) {
      return { success: false, error: 'User already exists' }
    }

    const hashedPassword = await bcrypt.hash(user.password, 10)
    await db
      .insert(usersTable)
      .values({
        ...user,
        password: hashedPassword,
        age: user.age || 0,
      })
      .returning()
    return { success: true, error: '' }
  } catch (error) {
    console.error('Error signing up:', error)
    return { success: false, error: 'Failed to sign up' }
  }
}

export const loginAction = async (email: string, password: string) => {
  try {
    const db = await dbPromise
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)

    const user = users[0]

    console.log(users)

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return { success: false, error: 'Invalid email or password' }
    }
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '24h',
      }
    )

    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60,
    })

    return { success: true, error: '' } // Remove password from returned user
  } catch (error) {
    console.error('Error logging in:', error)
    return { success: false, error: 'Failed to login' }
  }
}

export const userAuth = async () => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return null
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    // Solo retornamos los datos relevantes del usuario
    const { id, name, lastName, email, role, avatar } = decoded as UserType

    return { id, name, lastName, email, role, avatar }
  } catch (error) {
    console.error('Error verifying user:', error)
    return null
  }
}

export const logoutAction = async () => {
  const cookieStore = await cookies()
  cookieStore.delete('token')
  redirect('/login')
}
