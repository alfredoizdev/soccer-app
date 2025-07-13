import cloudinary from '@/lib/config/cloudinary'

/**
 * Sube una imagen a Cloudinary y retorna la URL segura
 * @param filePathOrBuffer Puede ser un path local o un buffer
 * @param folder Carpeta opcional en Cloudinary
 */
export async function uploadImageToCloudinary(
  filePathOrBuffer: string | Buffer,
  folder?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      // Si es buffer, hay que convertirlo a base64 data URI
      typeof filePathOrBuffer === 'string'
        ? filePathOrBuffer
        : `data:image/jpeg;base64,${filePathOrBuffer.toString('base64')}`,
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result?.secure_url || '')
      }
    )
  })
}
