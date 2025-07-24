import * as React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function SlideLatsMatchResultsSkeleton() {
  return (
    <div className='w-full mx-auto mt-2 md:mt-0'>
      <div className='flex flex-row md:gap-4 gap-2 overflow-x-auto'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='md:basis-1/2 lg:basis-1/3 min-w-[240px] p-1'>
            <Card className='rounded-none border-none'>
              <CardContent className='flex aspect-square flex-col items-center justify-center p-1 h-full w-full'>
                <Skeleton className='h-4 w-20 mb-2' />
                <div className='flex justify-center items-center gap-4 relative w-full'>
                  <div className='flex flex-col justify-center items-center gap-2'>
                    <Skeleton className='w-20 h-20 rounded-full' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-8 w-8 rounded-full' />
                  </div>
                  <span className='textsm font-semibold text-gray-300 rounded-full bg-gray-100 p-2'>
                    VS
                  </span>
                  <div className='flex flex-col justify-center items-center gap-2'>
                    <Skeleton className='w-20 h-20 rounded-full' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-8 w-8 rounded-full' />
                  </div>
                </div>
              </CardContent>
              <CardFooter className='flex justify-center items-center'>
                <Skeleton className='w-full h-10 rounded' />
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
