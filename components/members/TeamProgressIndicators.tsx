interface TeamProgressIndicatorsProps {
  winRate: number
  drawRate: number
  lossRate: number
}

export default function TeamProgressIndicators({
  winRate,
  drawRate,
  lossRate,
}: TeamProgressIndicatorsProps) {
  return (
    <div className='flex-shrink-0'>
      <div className='flex flex-row gap-6'>
        {/* Win Rate */}
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
                className='text-green-600'
                stroke='currentColor'
                strokeWidth='3'
                strokeDasharray={`${winRate}, 100`}
                strokeLinecap='round'
                fill='none'
                d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
              />
            </svg>
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-xl font-bold text-gray-900'>
                {Math.round(winRate)}%
              </span>
            </div>
          </div>
          <div className='text-sm font-medium text-gray-600'>Win Rate</div>
        </div>

        {/* Draw Rate */}
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
                className='text-yellow-600'
                stroke='currentColor'
                strokeWidth='3'
                strokeDasharray={`${drawRate}, 100`}
                strokeLinecap='round'
                fill='none'
                d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
              />
            </svg>
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-xl font-bold text-gray-900'>
                {Math.round(drawRate)}%
              </span>
            </div>
          </div>
          <div className='text-sm font-medium text-gray-600'>Draw Rate</div>
        </div>

        {/* Loss Rate */}
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
                className='text-red-600'
                stroke='currentColor'
                strokeWidth='3'
                strokeDasharray={`${lossRate}, 100`}
                strokeLinecap='round'
                fill='none'
                d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
              />
            </svg>
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-xl font-bold text-gray-900'>
                {Math.round(lossRate)}%
              </span>
            </div>
          </div>
          <div className='text-sm font-medium text-gray-600'>Loss Rate</div>
        </div>
      </div>
    </div>
  )
}
