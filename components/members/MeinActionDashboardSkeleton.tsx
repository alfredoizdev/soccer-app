import { Skeleton } from '@/components/ui/skeleton'

export default function MeinActionDashboardSkeleton() {
  return (
    <div className='flex justify-center items-center gap-9 w-full bg-gray-100 p-4 mt-10 md:mt-0'>
      {/* Club skeleton */}
      <div className='flex flex-col justify-center items-center'>
        <Skeleton className='w-20 h-20 md:w-32 md:h-32 rounded-full bg-gray-300' />
        <div className='flex flex-col justify-center items-center mt-2 text-sm md:text-base w-24'>
          <Skeleton className='h-4 w-20 mb-1 bg-gray-200' />
          <Skeleton className='h-3 w-16 bg-gray-200' />
        </div>
      </div>
      {/* Players skeleton */}
      <div className='flex flex-col justify-center items-center'>
        <Skeleton className='w-20 h-20 md:w-32 md:h-32 rounded-full bg-gray-300' />
        <Skeleton className='h-4 w-20 mt-2 bg-gray-200' />
        <Skeleton className='h-3 w-8 mt-1 bg-gray-200' />
      </div>
      {/* Matches skeleton */}
      <div className='flex flex-col justify-center items-center'>
        <Skeleton className='w-20 h-20 md:w-32 md:h-32 rounded-full bg-gray-300' />
        <Skeleton className='h-4 w-20 mt-2 bg-gray-200' />
        <Skeleton className='h-3 w-8 mt-1 bg-gray-200' />
      </div>
    </div>
  )
}
