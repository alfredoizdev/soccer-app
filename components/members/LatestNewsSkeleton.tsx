export default function LatestNewsSkeleton() {
  return (
    <section className='container mx-auto w-full'>
      <div className='flex w-full justify-between items-center mb-6 px-4'>
        <div className='h-8 w-40 bg-gray-200 rounded animate-pulse' />
        <div className='h-8 w-32 bg-gray-200 rounded animate-pulse' />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full px-4 mx-auto'>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className='flex flex-col bg-white shadow-md p-4 h-64 rounded animate-pulse'
          >
            <div className='h-32 w-full bg-gray-200 mb-4 rounded' />
            <div className='h-6 w-3/4 bg-gray-200 mb-2 rounded' />
            <div className='h-4 w-1/2 bg-gray-200 mb-2 rounded' />
            <div className='h-4 w-1/3 bg-gray-200 rounded' />
          </div>
        ))}
      </div>
    </section>
  )
}
