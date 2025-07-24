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
}

export function UpdatePostDrawer({ open, setOpen, post }: Props) {
  if (!open) return null

  return (
    <Drawer open={open} onOpenChange={setOpen} direction='right'>
      <DrawerContent>
        <div className='mx-auto w-full max-w-sm'>
          <DrawerHeader>
            <DrawerTitle>Edit Post</DrawerTitle>
            <DrawerDescription>Edit the post details.</DrawerDescription>
          </DrawerHeader>
          <PostForm
            mode='update'
            initialData={{
              title: post.title,
              content: post.content,
              mediaUrl: post.mediaUrl,
              mediaType: post.mediaType,
            }}
            postId={post.id}
            userId={post.userId}
          />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
