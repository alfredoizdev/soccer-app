import Image from 'next/image'
import React from 'react'

type ImagePreviewProps = {
  imagePreview: string
  handleClearImage: () => void
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imagePreview,
  handleClearImage,
}) => (
  <div className='flex items-center justify-center'>
    <div className='relative mt-2 h-24 w-24'>
      <Image
        src={imagePreview}
        width={100}
        height={100}
        alt='Preview'
        className='h-24 object-contain rounded'
      />
      <button
        type='button'
        className={`absolute h-7 w-7 top-1 right-1 bg-red-900 text-white rounded-full flex items-center justify-center p-1 shadow hover:bg-red-500 hover:text-white transition`}
        onClick={handleClearImage}
        aria-label='Eliminar imagen'
      >
        &times;
      </button>
    </div>
  </div>
)

export default ImagePreview
