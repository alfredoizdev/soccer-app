'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Users } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface Player {
  id: string
  name: string
  lastName: string
  avatar?: string
  position?: string
  jerseyNumber?: number
}

interface MentionItem {
  id: string
  name: string
  avatar?: string
  type: 'user' | 'player'
  displayName: string
  email?: string
  position?: string
  jerseyNumber?: number
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function MentionTextarea({
  value,
  onChange,
  placeholder = 'Add notes about the match. Type @ to mention users or players...',
  className = '',
  rows = 4,
}: MentionInputProps & { rows?: number }) {
  const [isMentioning, setIsMentioning] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionResults, setMentionResults] = useState<MentionItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [users, setUsers] = useState<User[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cargar usuarios y jugadores
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Importar server actions dinámicamente
        const { getUsersAction } = await import('@/lib/actions/users.action')
        const { getPlayersAction } = await import('@/lib/actions/player.action')

        // Cargar usuarios
        const usersResult = await getUsersAction()
        if (usersResult.data) {
          setUsers(
            usersResult.data.map((user) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar || undefined,
            }))
          )
        }

        // Cargar jugadores
        const playersResult = await getPlayersAction()
        if (playersResult.data) {
          setPlayers(
            playersResult.data.map((player) => ({
              id: player.id,
              name: player.name,
              lastName: player.lastName,
              avatar: player.avatar || undefined,
              position: player.position || undefined,
              jerseyNumber: player.jerseyNumber || undefined,
            }))
          )
        }
      } catch (error) {
        console.error('Error loading users and players:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Función para buscar menciones
  const searchMentions = useCallback(
    (query: string) => {
      if (!query.trim()) return []

      const results: MentionItem[] = []

      // Buscar usuarios
      users.forEach((user) => {
        const fullName = user.name
        if (
          fullName.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        ) {
          results.push({
            id: user.id,
            name: fullName,
            avatar: user.avatar,
            type: 'user',
            displayName: fullName,
            email: user.email,
          })
        }
      })

      // Buscar jugadores
      players.forEach((player) => {
        const fullName = `${player.name} ${player.lastName}`
        if (
          fullName.toLowerCase().includes(query.toLowerCase()) ||
          player.name.toLowerCase().includes(query.toLowerCase()) ||
          player.lastName.toLowerCase().includes(query.toLowerCase())
        ) {
          results.push({
            id: player.id,
            name: fullName,
            avatar: player.avatar,
            type: 'player',
            displayName: fullName,
            position: player.position,
            jerseyNumber: player.jerseyNumber,
          })
        }
      })

      return results
        .sort((a, b) => {
          // Priorizar coincidencias exactas al inicio
          const aStartsWith = a.name
            .toLowerCase()
            .startsWith(query.toLowerCase())
          const bStartsWith = b.name
            .toLowerCase()
            .startsWith(query.toLowerCase())

          if (aStartsWith && !bStartsWith) return -1
          if (!aStartsWith && bStartsWith) return 1

          return a.name.localeCompare(b.name)
        })
        .slice(0, 10) // Limitar a 10 resultados
    },
    [users, players]
  )

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart || 0

    onChange(newValue)
    setCursorPosition(cursorPos)

    // Detectar si estamos escribiendo una mención
    const beforeCursor = newValue.slice(0, cursorPos)
    const mentionMatch = beforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      setIsMentioning(true)
      const query = mentionMatch[1]
      setMentionQuery(query)
      const results = searchMentions(query)
      setMentionResults(results)
      setSelectedIndex(0)
    } else {
      setIsMentioning(false)
      setMentionQuery('')
      setMentionResults([])
    }
  }

  // Calcular la posición del cursor para posicionar el dropdown
  const getDropdownPosition = () => {
    if (!inputRef.current) return { top: 0, left: 0 }

    const textarea = inputRef.current
    const textBeforeCursor = value.slice(0, cursorPosition)
    const lines = textBeforeCursor.split('\n')
    const currentLine = lines[lines.length - 1]

    // Encontrar la posición del @ en la línea actual
    const atIndex = currentLine.lastIndexOf('@')
    if (atIndex === -1) return { top: 0, left: 0 }

    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight)
    const currentLineNumber = lines.length - 1

    // Calcular la posición del @ usando el ancho aproximado de caracteres
    const charWidth = 8.5 // Ancho aproximado de un carácter
    const atPosition = atIndex * charWidth

    // Posición relativa al contenedor (que es relative)
    const top = currentLineNumber * lineHeight + lineHeight + 5
    const left = Math.max(atPosition - 20, 10) // Ajustar más para centrar debajo del @

    return { top, left }
  }

  // Manejar selección de mención
  const handleMentionSelect = (mention: MentionItem) => {
    if (!inputRef.current) return

    const textarea = inputRef.current
    const beforeCursor = value.slice(0, cursorPosition)
    const afterCursor = value.slice(cursorPosition)

    // Encontrar la posición del @ más reciente
    const atIndex = beforeCursor.lastIndexOf('@')
    if (atIndex === -1) return

    // Crear la mención con el formato @nombre
    const mentionText = `@${mention.displayName}`

    // Reemplazar el texto desde el @ hasta el cursor
    const newValue = beforeCursor.slice(0, atIndex) + mentionText + afterCursor

    onChange(newValue)

    // Posicionar el cursor después de la mención
    const newCursorPos = atIndex + mentionText.length
    setCursorPosition(newCursorPos)

    // Limpiar el estado de mención
    setIsMentioning(false)
    setMentionQuery('')
    setMentionResults([])

    // Enfocar el textarea
    textarea.focus()
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  }

  // Función para renderizar el texto con menciones formateadas
  const renderFormattedText = (text: string) => {
    const mentionRegex = /@(\w+)/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      // Agregar texto antes de la mención
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }

      // Agregar la mención formateada
      parts.push(
        <span key={match.index} className='text-blue-600 underline'>
          {match[0]}
        </span>
      )

      lastIndex = match.index + match[0].length
    }

    // Agregar texto restante
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts.length > 0 ? parts : text
  }

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isMentioning) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < mentionResults.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : mentionResults.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (mentionResults.length > 0) {
          handleMentionSelect(mentionResults[selectedIndex])
        }
        break
      case 'Escape':
        setIsMentioning(false)
        setMentionQuery('')
        setMentionResults([])
        break
    }
  }

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMentioning(false)
        setMentionQuery('')
        setMentionResults([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className='w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        style={{
          color: 'transparent',
          caretColor: 'black',
        }}
      />

      {/* Overlay para mostrar el texto formateado */}
      <div
        className='absolute inset-0 p-3 pointer-events-none overflow-hidden'
        style={{
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
      >
        {renderFormattedText(value)}
      </div>

      {isMentioning && mentionResults.length > 0 && (
        <div
          ref={dropdownRef}
          className='absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto min-w-48 max-w-64'
          style={{
            top: getDropdownPosition().top,
            left: getDropdownPosition().left,
          }}
        >
          {mentionResults.map((mention, index) => (
            <div
              key={`${mention.type}-${mention.id}`}
              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
                index === selectedIndex
                  ? 'bg-blue-50 border-l-2 border-blue-500'
                  : ''
              }`}
              onClick={() => handleMentionSelect(mention)}
            >
              <Avatar className='w-8 h-8'>
                <AvatarImage
                  src={mention.avatar || '/no-profile.webp'}
                  alt={mention.displayName}
                />
                <AvatarFallback>
                  {mention.displayName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>

              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-sm truncate'>
                    {mention.displayName}
                  </span>
                  <Badge variant='outline' className='text-xs'>
                    {mention.type === 'user' ? (
                      <>
                        <User className='w-3 h-3 mr-1' />
                        User
                      </>
                    ) : (
                      <>
                        <Users className='w-3 h-3 mr-1' />
                        Player
                      </>
                    )}
                  </Badge>
                </div>

                {mention.type === 'user' && mention.email && (
                  <p className='text-xs text-gray-500 truncate'>
                    {mention.email}
                  </p>
                )}

                {mention.type === 'player' && mention.position && (
                  <p className='text-xs text-gray-500'>
                    {mention.position}
                    {mention.jerseyNumber && ` • #${mention.jerseyNumber}`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isMentioning && mentionResults.length === 0 && !isLoading && (
        <div
          className='absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 min-w-48 max-w-64'
          style={{
            top: getDropdownPosition().top,
            left: getDropdownPosition().left,
          }}
        >
          <p className='text-sm text-gray-500 text-center'>
            Type a name to search users or players...
          </p>
        </div>
      )}

      {isLoading && isMentioning && (
        <div
          className='absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 min-w-48 max-w-64'
          style={{
            top: getDropdownPosition().top,
            left: getDropdownPosition().left,
          }}
        >
          <p className='text-sm text-gray-500 text-center'>Loading...</p>
        </div>
      )}
    </div>
  )
}
