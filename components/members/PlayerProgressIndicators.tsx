interface PlayerProgressIndicatorsProps {
  conversionRate: number
  passingRate: number
}

export default function PlayerProgressIndicators({
  conversionRate,
  passingRate,
}: PlayerProgressIndicatorsProps) {
  return (
    <div className='flex-shrink-0'>
      <div className='flex flex-row lg:flex-col gap-6'>
        {/* Conversion Rate */}
        <div className='text-center'>
          <div className='relative w-24 h-24 mx-auto mb-2'>
            <svg className='w-24 h-24 transform -rotate-90' viewBox='0 0 36 36'>
              <path
                className='text-gray-200'
                stroke='currentColor'
                strokeWidth='3'
                fill='none'
                d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
              />
              <path
                className='text-gray-800'
                stroke='currentColor'
                strokeWidth='3'
                strokeDasharray={`${conversionRate}, 100`}
                strokeLinecap='round'
                fill='none'
                d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
              />
            </svg>
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-xl font-bold text-gray-900'>
                {Math.round(conversionRate)}%
              </span>
            </div>
          </div>
          <div className='text-sm font-medium text-gray-600'>Conversion</div>
        </div>

        {/* Passing Rate */}
        <div className='text-center'>
          <div className='relative w-24 h-24 mx-auto mb-2'>
            <svg className='w-24 h-24 transform -rotate-90' viewBox='0 0 36 36'>
              <path
                className='text-gray-200'
                stroke='currentColor'
                strokeWidth='3'
                fill='none'
                d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
              />
              <path
                className='text-gray-800'
                stroke='currentColor'
                strokeWidth='3'
                strokeDasharray={`${passingRate}, 100`}
                strokeLinecap='round'
                fill='none'
                d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
              />
            </svg>
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-xl font-bold text-gray-900'>
                {Math.round(passingRate)}%
              </span>
            </div>
          </div>
          <div className='text-sm font-medium text-gray-600'>Passing</div>
        </div>
      </div>
    </div>
  )
}
