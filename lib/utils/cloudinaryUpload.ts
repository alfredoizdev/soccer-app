import cloudinary from '@/lib/config/cloudinary'

/**
 * Sube una imagen a Cloudinary y retorna la URL segura
 * @param filePathOrBuffer Puede ser un path local o un buffer
 * @param folder Carpeta opcional en Cloudinary
 */
function uploadImageToCloudinary(
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

/**
 * Sube una imagen o video a Cloudinary y retorna la URL segura
 * @param buffer Buffer del archivo
 * @param type 'image' o 'video'
 * @param folder Carpeta opcional en Cloudinary
 */
function uploadMediaToCloudinary(
  buffer: Buffer,
  type: 'image' | 'video',
  folder?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      `data:${
        type === 'video' ? 'video/mp4' : 'image/jpeg'
      };base64,${buffer.toString('base64')}`,
      {
        folder,
        resource_type: type,
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result?.secure_url || '')
      }
    )
  })
}

/**
 * Elimina una imagen de Cloudinary usando su public_id
 * @param publicId El public_id de la imagen en Cloudinary
 */
function deleteImageFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error) => {
      if (error) return reject(error)
      resolve()
    })
  })
}

/**
 * Extrae el public_id de una URL de Cloudinary
 * @param url URL completa de la imagen en Cloudinary
 * @returns public_id o null si no se puede extraer
 */
function getPublicIdFromUrl(url: string): string | null {
  const match = url.match(/upload\/v\d+\/(.+)\.[a-zA-Z]+$/)
  return match ? match[1] : null
}

export const cloudinaryHandles = {
  uploadImageToCloudinary,
  uploadMediaToCloudinary,
  deleteImageFromCloudinary,
  getPublicIdFromUrl,
}
