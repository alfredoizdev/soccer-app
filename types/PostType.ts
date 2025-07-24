export type PostInput = {
  title: string
  content: string
  mediaUrl?: string
  mediaType?: string
  userId: string
  mediaFile?: File | Buffer
}

export type PostType = {
  id: string
  title: string
  content: string
  mediaUrl?: string
  mediaType?: string
  userId: string
  slug: string
  createdAt?: Date
  updatedAt?: Date
  userName?: string
  userAvatar?: string
  status: 'pending' | 'approved' | 'rejected'
}
