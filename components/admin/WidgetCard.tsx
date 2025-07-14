import React from 'react'

interface WidgetCardProps {
  title: string
  value: number
}

export default function WidgetCard({ title, value }: WidgetCardProps) {
  return (
    <div className='bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center'>
      <span className='text-lg font-semibold text-gray-600 mb-2'>{title}</span>
      <span className='text-3xl font-bold text-blue-600'>{value}</span>
    </div>
  )
}
