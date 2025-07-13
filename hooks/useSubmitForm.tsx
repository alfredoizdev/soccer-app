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
      const result = await actionFn({
        ...data,
        avatar: imageFile || '',
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
        toast.success('Operación exitosa')
        if (redirectPath) router.push(redirectPath)
      }
    } catch (error) {
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
  }
}

export default useSubmitForm
