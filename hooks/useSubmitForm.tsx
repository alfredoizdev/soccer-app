import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  useForm,
  SubmitHandler,
  DefaultValues,
  Path,
  PathValue,
} from 'react-hook-form'

export type UseSubmitFormProps<T extends Record<string, unknown>> = {
  actionFn: (
    data: T & { avatar?: File | string }
  ) => Promise<{ success?: boolean; error?: string }>
  defaultValues: DefaultValues<T>
  redirectPath?: string
}

// Utilidad para extraer el tipo de retorno de la función de acción
export type ActionReturn = {
  success?: boolean
  error?: string | null
  [key: string]: unknown
}

function useSubmitForm<T extends Record<string, unknown>>({
  actionFn,
  defaultValues,
  redirectPath,
}: UseSubmitFormProps<T> & {
  actionFn: (data: T & { avatar?: File | string }) => Promise<ActionReturn>
}) {
  const router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [actionResult, setActionResult] = useState<ActionReturn | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<T>({
    defaultValues,
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImageFile(null)
      setImagePreview(null)
    }
  }

  const handleClearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setValue('avatar' as Path<T>, undefined as PathValue<T, Path<T>>)
  }

  const handleFormSubmit: SubmitHandler<T> = async (data) => {
    try {
      // Detectar si el formulario usa 'avatar' o 'mediaFile'
      const extra: Record<string, unknown> = {}
      if ('avatar' in data) {
        extra.avatar =
          (data as unknown as { avatar?: File | string }).avatar ||
          imageFile ||
          ''
      } else if ('mediaFile' in data) {
        extra.mediaFile =
          (data as unknown as { mediaFile?: File | string }).mediaFile ||
          imageFile ||
          ''
      }
      const result = await actionFn({
        ...data,
        ...extra,
      })
      setActionResult(result)
      // Adaptar error null a undefined aquí
      const { success, error } = result
      const normalizedError = error === null ? undefined : error

      if (normalizedError) {
        console.error('Error:', normalizedError)
        return
      }

      if (success) {
        toast.success('Operation completed successfully')
        if (redirectPath) router.push(redirectPath)
      }
    } catch (error) {
      toast.error('Error submitting form')
      console.error('Error:', error)
    }
  }

  return {
    isSubmitting,
    errors,
    handleFormSubmit,
    handleImageChange,
    handleClearImage,
    handleSubmit,
    register,
    imagePreview,
    actionResult,
    setValue,
    watch,
  }
}

export default useSubmitForm
