import React, { useRef, useState } from 'react'
import { UseFormRegister, FieldValues, Path } from 'react-hook-form'
import Image from 'next/image'

interface MediaInputProps<T extends FieldValues = FieldValues> {
  name: Path<T>
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  register?: UseFormRegister<T>
  previewUrl?: string // Permite pasar una url inicial
  onClearMedia?: () => void
  onUploadProgress?: (progress: number) => void // Nuevo: callback para progreso
  disabled?: boolean // Nuevo: para deshabilitar input durante submit
}

function isValidMediaUrl(url: unknown): url is string {
  return (
    typeof url === 'string' &&
    url.trim() !== '' &&
    (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('/'))
  )
}

function getMediaType(file: File | string | null): 'image' | 'video' | null {
  if (!file) return null
  if (typeof file === 'string') {
    if (file.match(/\.(mp4|webm|mov|avi)$/i)) return 'video'
    if (file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) return 'image'
    return null
  }
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('image/')) return 'image'
  return null
}

function MediaInput<T extends FieldValues = FieldValues>({
  name,
  onChange,
  className = '',
  register,
  previewUrl,
  onClearMedia,
  onUploadProgress,
  disabled,
}: MediaInputProps<T>) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  React.useEffect(() => {
    if (
      previewUrl &&
      typeof previewUrl === 'string' &&
      previewUrl.trim() !== ''
    ) {
      setPreview(previewUrl)
      setMediaType(getMediaType(previewUrl))
    } else {
      setPreview(null)
      setMediaType(null)
    }
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const type = getMediaType(file)
      setMediaType(type)
      if (type === 'image' && file.size > 1024 * 1024) {
        setError('Image size must be less than 1MB.')
        if (inputRef.current) inputRef.current.value = ''
        return
      }
      if (type === 'video' && file.size > 3 * 1024 * 1024) {
        setError('Video size must be less than 3MB.')
        if (inputRef.current) inputRef.current.value = ''
        return
      }
      setError(null)
      try {
        const url = URL.createObjectURL(file)
        if (url && typeof url === 'string' && url.trim() !== '') {
          setPreview(url)
        }
      } catch {
        setPreview(null)
      }
      setUploadProgress(0)
      onUploadProgress?.(0)
    }
    onChange?.(e)
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const type = getMediaType(file)
      setMediaType(type)
      if (type === 'image' && file.size > 1024 * 1024) {
        setError('Image size must be less than 1MB.')
        if (inputRef.current) inputRef.current.value = ''
        setPreview(null)
        return
      }
      if (type === 'video' && file.size > 3 * 1024 * 1024) {
        setError('Video size must be less than 3MB.')
        if (inputRef.current) inputRef.current.value = ''
        setPreview(null)
        return
      }
      setError(null)
      setPreview(URL.createObjectURL(file))
      setUploadProgress(0)
      onUploadProgress?.(0)
      if (inputRef.current) {
        const dt = new DataTransfer()
        dt.items.add(file)
        inputRef.current.files = dt.files
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

  // Exponer método para actualizar el progreso desde el padre
  React.useEffect(() => {
    if (onUploadProgress) {
      onUploadProgress(uploadProgress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadProgress])

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
      {!isValidMediaUrl(preview) && (
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
          <span>Drag and drop an image or video or click</span>
        </div>
      )}
      {isValidMediaUrl(preview) && mediaType === 'image' && (
        <div className='relative flex flex-col items-center mb-2'>
          <Image
            src={preview}
            alt='Preview'
            width={128}
            height={128}
            className='w-32 h-32 object-cover rounded'
          />
          <button
            type='button'
            className='absolute top-1 right-1 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-700 transition'
            onClick={(e) => {
              e.preventDefault()
              setPreview(null)
              setMediaType(null)
              if (inputRef.current) {
                inputRef.current.value = ''
                const event = new Event('change', { bubbles: true })
                inputRef.current.dispatchEvent(event)
              }
              if (onClearMedia) {
                onClearMedia()
              }
            }}
            aria-label='Remove image'
          >
            &times;
          </button>
        </div>
      )}
      {isValidMediaUrl(preview) && mediaType === 'video' && (
        <div className='relative flex flex-col items-center mb-2'>
          <video
            src={preview}
            controls
            className='w-48 h-32 object-cover rounded'
          />
          <button
            type='button'
            className='absolute top-1 right-1 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-700 transition'
            onClick={(e) => {
              e.preventDefault()
              setPreview(null)
              setMediaType(null)
              if (inputRef.current) {
                inputRef.current.value = ''
                const event = new Event('change', { bubbles: true })
                inputRef.current.dispatchEvent(event)
              }
              if (onClearMedia) {
                onClearMedia()
              }
            }}
            aria-label='Remove video'
          >
            &times;
          </button>
        </div>
      )}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className='w-full bg-gray-200 rounded-full h-2.5 mb-2'>
          <div
            className='bg-blue-600 h-2.5 rounded-full transition-all duration-200'
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
      {register ? (
        <input
          type='file'
          accept='image/*,video/*'
          className='hidden'
          {...register(name, { onChange: handleChange })}
          ref={inputRef}
          disabled={disabled}
        />
      ) : (
        <input
          type='file'
          accept='image/*,video/*'
          name={name}
          onChange={handleChange}
          className='hidden'
          ref={inputRef}
          disabled={disabled}
        />
      )}
      <button
        type='button'
        className='mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
        onClick={(e) => {
          e.preventDefault()
          inputRef.current?.click()
        }}
        disabled={disabled}
      >
        Select image or video
      </button>
      {error && <p className='text-red-500 mt-2'>{error}</p>}
    </label>
  )
}

export default MediaInput
