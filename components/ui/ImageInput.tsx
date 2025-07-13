import React, { useRef, useState } from 'react'
import { UseFormRegister, FieldValues, Path } from 'react-hook-form'
import Image from 'next/image'

interface ImageInputProps<T extends FieldValues = FieldValues> {
  name: Path<T>
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  register?: UseFormRegister<T>
  previewUrl?: string // Permite pasar una url inicial
  onClearImage?: () => void // Nuevo: handler para limpiar imagen
}

function ImageInput<T extends FieldValues = FieldValues>({
  name,
  onChange,
  className = '',
  register,
  previewUrl,
  onClearImage,
}: ImageInputProps<T>) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPreview(URL.createObjectURL(file))
    }
    onChange?.(e)
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setPreview(URL.createObjectURL(file))
      if (inputRef.current) {
        const dt = new DataTransfer()
        dt.items.add(file)
        inputRef.current.files = dt.files
        // Disparar el evento manualmente
        const event = new Event('change', { bubbles: true })
        inputRef.current.dispatchEvent(event)
      }
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  return (
    <label
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
      } ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDrag}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
    >
      {preview ? (
        <div className='relative flex flex-col items-center mb-2'>
          <Image
            width={100}
            height={100}
            src={preview}
            alt='Preview'
            className='w-32 h-32 object-cover rounded'
          />
          <button
            type='button'
            className='absolute top-1 right-1 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-700 transition'
            onClick={(e) => {
              e.preventDefault()
              setPreview(null)
              if (inputRef.current) {
                inputRef.current.value = ''
                const event = new Event('change', { bubbles: true })
                inputRef.current.dispatchEvent(event)
              }
              if (onClearImage) {
                onClearImage()
              }
            }}
            aria-label='Remove image'
          >
            &times;
          </button>
        </div>
      ) : (
        <div className='flex flex-col items-center text-gray-400 mb-2'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-12 w-12 mb-1'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z'
            />
          </svg>
          <span>Drag and drop an image or click</span>
        </div>
      )}
      {register ? (
        <input
          type='file'
          accept='image/*'
          className='hidden'
          {...register(name, { onChange: handleChange })}
          ref={inputRef}
        />
      ) : (
        <input
          type='file'
          accept='image/*'
          name={name}
          onChange={handleChange}
          className='hidden'
          ref={inputRef}
        />
      )}
      <button
        type='button'
        className='mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
        onClick={(e) => {
          e.preventDefault()
          inputRef.current?.click()
        }}
      >
        Select image
      </button>
    </label>
  )
}

export default ImageInput
