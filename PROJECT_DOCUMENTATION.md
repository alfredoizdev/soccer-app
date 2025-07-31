# Soccer App - Documentación del Proyecto

## 📋 Índice

1. [Arquitectura General](#arquitectura-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Componentes Principales](#componentes-principales)
4. [Dependencias Críticas](#dependencias-críticas)
5. [Tipos y Interfaces](#tipos-y-interfaces)
6. [Estado Global](#estado-global)
7. [Acciones del Servidor](#acciones-del-servidor)
8. [Base de Datos](#base-de-datos)
9. [Guías de Desarrollo](#guías-de-desarrollo)
10. [Convenciones](#convenciones)

## 🏗️ Arquitectura General

### Stack Tecnológico

- **Frontend**: Next.js 14 con App Router
- **UI**: Tailwind CSS + Shadcn UI + Radix UI
- **Base de Datos**: PostgreSQL con Drizzle ORM
- **Estado**: Redux Toolkit + Zustand
- **Autenticación**: NextAuth.js
- **Streaming**: WebRTC + Socket.io
- **Iconos**: Lucide React

### Patrones de Arquitectura

- **Server Components**: Por defecto, usar Server Components
- **Client Components**: Solo cuando sea necesario (eventos, estado, APIs del navegador)
- **Server Actions**: Para formularios y operaciones CRUD
- **API Routes**: Solo para streaming y WebSocket

## 📁 Estructura de Carpetas

```
soccer-app/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Rutas administrativas
│   ├── (auth)/            # Rutas de autenticación
│   ├── (root)/            # Rutas públicas
│   └── api/               # API routes (solo streaming)
├── components/            # Componentes reutilizables
│   ├── admin/            # Componentes administrativos
│   ├── members/          # Componentes para miembros
│   └── ui/               # Componentes UI base
├── lib/                  # Utilidades y lógica
│   ├── actions/          # Server Actions
│   ├── stores/           # Estado global
│   └── utils/            # Utilidades
├── database/             # Esquema y migraciones
├── hooks/                # Custom hooks
└── types/                # Definiciones de tipos
```

## 🧩 Componentes Principales

### Calendario de Partidos

**Archivos relacionados:**

- `components/members/MatchCalendarMobile.tsx` - Vista móvil del calendario
- `components/members/MatchCalendarEvent.tsx` - Componente de evento individual
- `components/members/MatchCalendarEventModal.tsx` - Modal de detalles del evento

**Dependencias críticas:**

- `MatchEvent` type (definido en MatchCalendarEvent.tsx)
- `date-fns` para manipulación de fechas
- `lucide-react` para iconos

**Funcionalidades:**

- Filtrado por pestañas (General, Upcoming, Past)
- Navegación entre meses
- Modal de detalles al hacer clic
- Estados visuales según status del partido

### Sistema de Streaming

**Archivos relacionados:**

- `components/admin/StreamBroadcaster.tsx` - Emisor de stream
- `components/members/StreamViewer.tsx` - Visor de stream
- `hooks/useVideoStream.ts` - Hook para manejo de video

**Dependencias críticas:**

- WebRTC para transmisión
- Socket.io para señalización
- `useVideoStream` hook

### Gestión de Jugadores

**Archivos relacionados:**

- `components/admin/PlayerForm.tsx` - Formulario de jugador
- `components/members/PlayerMatchCard.tsx` - Tarjeta de jugador
- `components/admin/PlayerTable/` - Tabla de jugadores

**Dependencias críticas:**

- `PlayerType` interface
- Server actions en `lib/actions/player.action.ts`
- Cloudinary para avatares

### Gestión de Equipos

**Archivos relacionados:**

- `components/admin/TeamTable/` - Tabla de equipos
- `components/admin/TeamField.tsx` - Campo de selección de equipo
- `components/members/TeamPlayersSection.tsx` - Sección de jugadores del equipo

**Dependencias críticas:**

- `TeamType` interface
- Server actions en `lib/actions/`
- Avatar component para logos

## 🔗 Dependencias Críticas

### Componentes UI Base

```typescript
// Siempre usar estos componentes en lugar de HTML nativo
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Table } from '@/components/ui/table'
```

### Hooks Personalizados

```typescript
// Para formularios
import { useForm } from 'react-hook-form'

// Para debounce
import { useDebounceCallback } from '@/hooks/useDebounceCallback'

// Para partidos en vivo
import { useLiveMatch } from '@/hooks/useLiveMatch'

// Para streams
import { useVideoStream } from '@/hooks/useVideoStream'
```

### Utilidades Importantes

```typescript
// Para fechas
import { format, isSameDay, isAfter } from 'date-fns'

// Para subida de archivos
import { cloudinaryUpload } from '@/lib/utils/cloudinaryUpload'

// Para abreviar nombres de equipos
import { abbreviateTeam } from '@/lib/utils/abbreviateTeam'
```

## 📝 Tipos y Interfaces

### MatchEvent (Calendario)

```typescript
export type MatchEvent = {
  title: string
  start: Date
  end: Date
  resource: {
    id: string
    team1: string
    team2: string
    team1Avatar?: string
    team2Avatar?: string
    location?: string | null
    address?: string
    status?: 'active' | 'inactive'
    notes?: string | null
  }
}
```

### PlayerType

```typescript
export interface PlayerType {
  id: string
  name: string
  lastName: string
  avatar?: string | null
  jerseyNumber?: number | null
  position?: string | null
  teamId?: string | null
  organizationId?: string | null
}
```

### TeamType

```typescript
export interface TeamType {
  id: string
  name: string
  logo?: string | null
  organizationId?: string | null
}
```

## 🌐 Estado Global

### Redux Toolkit (Stores)

- `lib/stores/globalStore.ts` - Estado global de la aplicación
- `lib/stores/liveMatchStore.ts` - Estado de partidos en vivo
- `lib/stores/slices/` - Slices específicos (user, player, organization, jersey)

### Zustand

- Para estado local complejo
- Para persistencia de datos

## ⚡ Acciones del Servidor

### Estructura de Server Actions

```typescript
// Ubicación: lib/actions/
;-auth.action.ts - // Autenticación
  matches.action.ts - // Gestión de partidos
  player.action.ts - // Gestión de jugadores
  posts.action.ts - // Gestión de posts
  streaming.action.ts - // Gestión de streams
  users.action.ts // Gestión de usuarios
```

### Patrón de Uso

```typescript
// Siempre usar 'use server' al inicio
'use server'

// Importar dbPromise
import { dbPromise } from '@/database/drizzle'

// Usar toast para notificaciones
import { toast } from 'sonner'
```

## 🗄️ Base de Datos

### Esquema Principal

- `database/schema.ts` - Definición de tablas
- `database/migrations/` - Migraciones de Drizzle
- `database/drizzle.ts` - Configuración de conexión

### Tablas Críticas

- `matches` - Partidos
- `players` - Jugadores
- `teams` - Equipos
- `organizations` - Organizaciones
- `liveMatchData` - Datos en vivo
- `playerStats` - Estadísticas de jugadores

### Migraciones

```bash
# Generar migración
npm run db:generate

# Ejecutar migración
npm run db:migrate

# Ver estado
npm run db:studio
```

## 🛠️ Guías de Desarrollo

### Antes de Modificar Componentes

1. **Identificar dependencias:**

   - Buscar imports del componente
   - Verificar tipos utilizados
   - Revisar hooks personalizados

2. **Verificar impacto:**

   - Buscar usos del componente en el proyecto
   - Revisar tests relacionados
   - Verificar rutas que lo utilizan

3. **Probar cambios:**
   - Ejecutar `npm run lint`
   - Ejecutar `npm run build`
   - Probar funcionalidad específica

### Patrones de Modificación

#### Para Componentes de Calendario

```typescript
// ✅ Correcto - Mantener estructura existente
const filterEventsByTab = (events: MatchEvent[]) => {
  // Lógica de filtrado
}

// ❌ Incorrecto - Cambiar estructura de MatchEvent
const filterEventsByTab = (events: any[]) => {
  // Lógica de filtrado
}
```

#### Para Formularios

```typescript
// ✅ Correcto - Usar react-hook-form
const { register, handleSubmit, setValue } = useForm()

// ❌ Incorrecto - Usar estado manual
const [formData, setFormData] = useState({})
```

#### Para Tablas

```typescript
// ✅ Correcto - Usar componentes de shadcn
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ❌ Incorrecto - Usar HTML nativo
;<table>
  <tr>
    <td>...</td>
  </tr>
</table>
```

### Manejo de Estados

#### Estados de Partidos

```typescript
// Estados válidos para partidos
type MatchStatus = 'scheduled' | 'active' | 'completed' | 'cancelled'

// Estados de stream
type StreamStatus = 'idle' | 'connecting' | 'live' | 'ended'
```

#### Estados de Usuario

```typescript
// Roles de usuario
type UserRole = 'admin' | 'member' | 'guest'

// Estados de autenticación
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'
```

## 📋 Convenciones

### Nomenclatura

- **Componentes**: PascalCase (`MatchCalendarMobile`)
- **Archivos**: kebab-case (`match-calendar-mobile.tsx`)
- **Funciones**: camelCase (`handleEventClick`)
- **Variables**: camelCase (`currentDate`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Estructura de Componentes

```typescript
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types/Interfaces
interface ComponentProps {
  // props
}

// 3. Component
export default function ComponentName({ prop }: ComponentProps) {
  // 4. State
  const [state, setState] = useState()

  // 5. Handlers
  const handleClick = () => {
    // logic
  }

  // 6. Render
  return <div>{/* JSX */}</div>
}
```

### Manejo de Errores

```typescript
// ✅ Correcto - Usar try-catch en server actions
try {
  const result = await dbPromise
  return { success: true, data: result }
} catch (error) {
  console.error('Error:', error)
  return { success: false, error: 'Error message' }
}

// ✅ Correcto - Usar toast para notificaciones
toast.success('Operation completed')
toast.error('Something went wrong')
```

### Testing

```typescript
// Ubicación: __tests__/
// Nomenclatura: ComponentName.test.tsx

// Patrón AAA (Arrange, Act, Assert)
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Arrange
    const props = {}

    // Act
    render(<ComponentName {...props} />)

    // Assert
    expect(screen.getByText('text')).toBeInTheDocument()
  })
})
```

## 🚨 Reglas Importantes

### NO HACER

- ❌ Crear API routes para CRUD (usar Server Actions)
- ❌ Modificar tipos existentes sin verificar impacto
- ❌ Usar HTML nativo en lugar de componentes UI
- ❌ Cambiar estructura de datos sin migración
- ❌ Usar `any` type
- ❌ Commitear sin probar build

### SÍ HACER

- ✅ Usar Server Actions para formularios
- ✅ Verificar dependencias antes de modificar
- ✅ Usar componentes de shadcn/ui
- ✅ Crear migraciones para cambios de DB
- ✅ Usar TypeScript strict mode
- ✅ Probar build antes de commit

## 🔍 Búsqueda de Componentes

### Para encontrar usos de un componente:

```bash
# Buscar imports
grep -r "import.*ComponentName" .

# Buscar JSX
grep -r "<ComponentName" .

# Buscar en tests
find . -name "*.test.tsx" -exec grep -l "ComponentName" {} \;
```

### Para encontrar tipos:

```bash
# Buscar definición de tipo
grep -r "interface.*TypeName\|type.*TypeName" .

# Buscar usos del tipo
grep -r "TypeName" .
```

## 📞 Contacto y Soporte

### Antes de hacer cambios importantes:

1. Revisar esta documentación
2. Buscar componentes relacionados
3. Verificar tests existentes
4. Probar en desarrollo
5. Ejecutar lint y build

### Comandos útiles:

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Lint
npm run lint

# Tests
npm run test

# Base de datos
npm run db:studio
npm run db:generate
npm run db:migrate
```

---

**Última actualización**: $(date)
**Versión del documento**: 1.0
