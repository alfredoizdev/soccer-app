import { useState, useEffect, useRef } from 'react'
import { getUsersAction } from '@/lib/actions/users.action'
import { UserType } from '@/types/UserType'
import { Loader2 } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface UserSearchProps {
  onSelect: (user: UserType) => void
  onUserList?: (users: UserType[]) => void
}

export default function UserSearch({ onSelect, onUserList }: UserSearchProps) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<UserType[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasSelected, setHasSelected] = useState(false)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (search.length < 2) {
      setResults([])
      setShowDropdown(false)
      setLoading(false)
      setHasSelected(false)
      if (onUserList) onUserList([])
      return
    }
    setLoading(true)
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }
    debounceTimeout.current = setTimeout(async () => {
      const res = await getUsersAction()
      const users: UserType[] = res.data || []
      const filtered = users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.lastName.toLowerCase().includes(search.toLowerCase())
      )
      setResults(filtered)
      setShowDropdown(true)
      setLoading(false)
      if (onUserList) onUserList(filtered)
    }, 500)
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <div className='relative w-full'>
      <input
        type='text'
        placeholder='Search user by name...'
        className='border-2 border-gray-300 rounded-md p-2 w-full'
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setHasSelected(false)
        }}
        onFocus={() => search.length >= 2 && setShowDropdown(true)}
        autoComplete='off'
      />
      {loading && (
        <Loader2 className='absolute right-2 top-3 w-4 h-4 text-gray-400 animate-spin' />
      )}
      {showDropdown && results.length > 0 && (
        <ul className='absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg'>
          {results.map((user) => (
            <li
              key={user.id}
              className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer'
              onClick={() => {
                setSearch(`${user.name} ${user.lastName}`)
                setShowDropdown(false)
                setResults([])
                setHasSelected(true)
                onSelect(user)
              }}
            >
              <Avatar className='w-7 h-7'>
                <AvatarImage
                  className='object-cover'
                  src={user.avatar ?? ''}
                  alt={user.name}
                />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className='truncate'>
                {user.name} {user.lastName}{' '}
                <span className='text-gray-500 text-xs'>({user.email})</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {showDropdown &&
        !loading &&
        results.length === 0 &&
        search.length >= 2 &&
        !hasSelected && (
          <div className='absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 px-4 py-2 text-gray-500'>
            No users found
          </div>
        )}
    </div>
  )
}
