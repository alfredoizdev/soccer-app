'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import useSubmitForm from '@/hooks/useSubmitForm'
import { createPost, updatePost } from '@/lib/actions/posts.action'
import MediaInput from '@/components/MediaInput'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface PostFormProps {
  mode: 'create' | 'update'
  initialData?: {
    title?: string
    content?: string
    mediaUrl?: string
    mediaType?: string
  }
  postId?: string
  userId: string
  onSuccess?: () => void
}

type PostFormInputs = {
  title: string
  content: string
  mediaUrl?: string
  mediaType?: string
  mediaFile?: File
}

export default function PostForm({
  mode,
  initialData,
  postId,
  userId,
  redirectPath = '/members/posts',
  onSuccess,
}: PostFormProps & { redirectPath?: string }) {
  const defaultValues: PostFormInputs = {
    title: initialData?.title || '',
    content: initialData?.content || '',
    mediaUrl: initialData?.mediaUrl || '',
    mediaType: initialData?.mediaType || '',
  }

  const {
    register,
    handleSubmit,
    errors,
    handleFormSubmit,
    isSubmitting,
    actionResult,
    setValue,
  } = useSubmitForm<PostFormInputs>({
    actionFn: async (data) => {
      const postData = { ...data, userId }
      let result
      if (mode === 'create') {
        result = await createPost(postData)
      } else if (mode === 'update' && postId) {
        result = await updatePost({ ...postData, id: postId })
      }
      return {
        data: result,
        success: !!result,
        error: !result ? 'Error creating/updating post' : undefined,
      }
    },
    defaultValues,
    redirectPath,
  })

  // Eliminado uploadProgress, solo usamos uploading
  const [uploading, setUploading] = useState(false)

  const handleUploadProgress = (progress: number) => {
    setUploading(progress > 0 && progress < 100)
  }

  useEffect(() => {
    if (actionResult?.success) {
      if (onSuccess) onSuccess()
    }
    if (actionResult?.error) {
      toast.error(actionResult.error)
    }
  }, [actionResult, onSuccess])

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className='space-y-4 w-full max-w-xl mx-auto'
    >
      <div>
        <label htmlFor='post-title' className='block font-semibold mb-1'>
          Title
        </label>
        <input
          id='post-title'
          type='text'
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          {...register('title', {
            required: 'Title is required',
            minLength: { value: 3, message: 'Min 3 chars' },
            maxLength: { value: 100, message: 'Max 100 chars' },
          })}
        />
        {errors.title && (
          <span className='text-red-500 text-xs'>{errors.title.message}</span>
        )}
      </div>
      <div>
        <label htmlFor='post-content' className='block font-semibold mb-1'>
          Content
        </label>
        <textarea
          id='post-content'
          className='border-2 border-gray-300 rounded-md p-2 w-full'
          rows={5}
          {...register('content', {
            required: 'Content is required',
            minLength: { value: 10, message: 'Min 10 chars' },
          })}
        />
        {errors.content && (
          <span className='text-red-500 text-xs'>{errors.content.message}</span>
        )}
      </div>
      <div>
        <label className='block font-semibold mb-1'>Image or Video</label>
        <MediaInput
          name='mediaFile'
          onChange={(e) => {
            const file = e.target.files?.[0]
            setValue('mediaFile', file)
          }}
          onClearMedia={() => {
            setValue('mediaFile', undefined)
            toast.info(
              'Media removed. The previous image or video will be deleted when you save the post.'
            )
          }}
          onUploadProgress={handleUploadProgress}
          disabled={isSubmitting || uploading}
          previewUrl={initialData?.mediaUrl}
        />
      </div>
      <Button
        type='submit'
        disabled={isSubmitting || uploading}
        className='w-full rounded-none'
      >
        {mode === 'create' ? 'Create Post' : 'Update Post'}
      </Button>
    </form>
  )
}
