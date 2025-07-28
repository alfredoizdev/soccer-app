import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import { Users } from 'lucide-react'

export default function TeamsSectionSkeleton() {
  return (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-6'>
        <Skeleton className='h-8 w-24' />
        <div className='flex items-center gap-2'>
          <Users className='w-4 h-4 text-gray-400' />
          <Skeleton className='h-4 w-16' />
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className='h-full'>
            <CardContent className='p-6 flex flex-col items-center text-center'>
              <div className='relative mb-4'>
                <Skeleton className='w-20 h-20 rounded-full' />
                <Skeleton className='absolute -bottom-1 -right-1 w-6 h-6 rounded-full' />
              </div>

              <Skeleton className='h-6 w-32 mb-2' />
              <Skeleton className='h-4 w-48 mb-4' />

              <div className='flex items-center gap-2 mt-auto'>
                <Users className='w-4 h-4 text-gray-400' />
                <Skeleton className='h-4 w-20' />
              </div>

              <Skeleton className='h-4 w-24 mt-4' />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
