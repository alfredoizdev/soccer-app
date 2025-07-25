import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import PostForm from '@/components/members/PostForm'
import { PostType } from '@/types/PostType'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  post: PostType
  onSuccess?: () => void
}

export function UpdatePostDrawer({ open, setOpen, post, onSuccess }: Props) {
  if (!open) return null

  return (
    <Drawer open={open} onOpenChange={setOpen} direction='right'>
      <DrawerContent className='rounded-none'>
        <div className='mx-auto w-full max-w-sm p-4'>
          <DrawerHeader>
            <DrawerTitle>Edit Post</DrawerTitle>
            <DrawerDescription>Edit the post details.</DrawerDescription>
          </DrawerHeader>
          <PostForm
            key={post.id}
            mode='update'
            initialData={{
              title: post.title,
              content: post.content,
              mediaUrl: post.mediaUrl || '',
              mediaType: post.mediaType || '',
            }}
            postId={post.id}
            userId={post.userId}
            redirectPath='/admin/posts'
            onSuccess={onSuccess}
          />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant='outline' className='rounded-none'>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
