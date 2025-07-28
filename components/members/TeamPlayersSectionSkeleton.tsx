import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import { Users } from 'lucide-react'

export default function TeamPlayersSectionSkeleton() {
  return (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <Skeleton className='h-8 w-48 mb-2' />
          <Skeleton className='h-4 w-32' />
        </div>
        <div className='flex items-center gap-2'>
          <Users className='w-4 h-4 text-gray-400' />
          <Skeleton className='h-4 w-16' />
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className='h-full'>
            <CardContent className='p-4 flex flex-col items-center text-center'>
              <div className='relative mb-3'>
                <Skeleton className='w-16 h-16 rounded-full' />
                <Skeleton className='absolute -top-1 -right-1 w-6 h-6 rounded-full' />
              </div>

              <Skeleton className='h-5 w-32 mb-1' />
              <Skeleton className='h-4 w-20 mb-2' />
              <Skeleton className='h-3 w-16 mb-2' />

              <div className='flex items-center gap-4 mt-auto'>
                <div className='flex items-center gap-1'>
                  <Skeleton className='h-3 w-4' />
                  <Skeleton className='h-3 w-8' />
                </div>
                <div className='flex items-center gap-1'>
                  <Skeleton className='h-3 w-4' />
                  <Skeleton className='h-3 w-8' />
                </div>
              </div>

              <Skeleton className='h-3 w-20 mt-3' />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
