# Mapa de Dependencias - Soccer App

## 🗺️ Mapa de Componentes y Dependencias

### 📅 Sistema de Calendario

```
MatchCalendarMobile.tsx
├── Dependencias:
│   ├── MatchEvent (type)
│   ├── date-fns (format, startOfMonth, endOfMonth, etc.)
│   ├── lucide-react (ChevronLeft, ChevronRight, Calendar)
│   ├── @/components/ui/button
│   ├── @/components/ui/card
│   └── MatchCalendarEventModal.tsx
├── Usado en:
│   └── app/(root)/members/matches/calendar/page.tsx
└── Funcionalidades críticas:
    ├── Filtrado por pestañas (General, Upcoming, Past)
    ├── Navegación entre meses
    ├── Modal de detalles
    └── Estados visuales según status
```

```
MatchCalendarEvent.tsx
├── Dependencias:
│   ├── react-big-calendar (EventProps)
│   ├── @/lib/utils/abbreviateTeam
│   ├── @fortawesome/react-fontawesome
│   └── @fortawesome/free-solid-svg-icons
├── Define:
│   └── MatchEvent (type) - USADO POR MUCHOS COMPONENTES
└── Usado en:
    └── react-big-calendar como componente de evento
```

```
MatchCalendarEventModal.tsx
├── Dependencias:
│   ├── MatchEvent (type)
│   ├── @/components/ui/dialog
│   └── @/components/ui/button
├── Usado en:
│   └── MatchCalendarMobile.tsx
└── Funcionalidades:
    └── Modal de detalles del evento
```

### 🎥 Sistema de Streaming

```
StreamBroadcaster.tsx
├── Dependencias:
│   ├── useVideoStream (hook)
│   ├── Socket.io
│   ├── WebRTC
│   └── @/components/ui/button
├── Usado en:
│   └── app/(admin)/admin/streams/[matchId]/page.tsx
└── Funcionalidades críticas:
    ├── Transmisión de video
    ├── Conexión WebRTC
    └── Señalización Socket.io
```

```
StreamViewer.tsx
├── Dependencias:
│   ├── useVideoStream (hook)
│   ├── Socket.io
│   └── WebRTC
├── Usado en:
│   └── app/(root)/members/streams/[id]/page.tsx
└── Funcionalidades críticas:
    ├── Recepción de video
    ├── Conexión WebRTC
    └── Señalización Socket.io
```

```
useVideoStream.ts
├── Dependencias:
│   ├── Socket.io
│   ├── WebRTC APIs
│   └── React hooks
├── Usado en:
│   ├── StreamBroadcaster.tsx
│   └── StreamViewer.tsx
└── Funcionalidades:
    ├── Gestión de conexión WebRTC
    ├── Manejo de streams
    └── Estados de conexión
```

### 👥 Gestión de Jugadores

```
PlayerForm.tsx
├── Dependencias:
│   ├── react-hook-form
│   ├── @/components/ui/button
│   ├── @/components/ui/input
│   ├── @/components/ui/select
│   ├── @/lib/actions/player.action.ts
│   └── @/lib/utils/cloudinaryUpload
├── Usado en:
│   ├── app/(admin)/admin/players/new/page.tsx
│   └── app/(root)/members/players/add/page.tsx
└── Funcionalidades críticas:
    ├── Creación de jugadores
    ├── Subida de avatares
    └── Validación de formularios
```

```
PlayerMatchCard.tsx
├── Dependencias:
│   ├── PlayerType (interface)
│   ├── @/components/ui/card
│   ├── @/components/ui/avatar
│   └── @/lib/utils/formatDate
├── Usado en:
│   └── components/members/TeamPlayersSection.tsx
└── Funcionalidades:
    └── Visualización de jugador en partido
```

```
PlayerTable/
├── columns.tsx
│   ├── Dependencias:
│   │   ├── @/components/ui/table
│   │   ├── @/components/ui/button
│   │   └── @/components/ui/avatar
│   └── Usado en:
│       └── DataTablePlayer.tsx
├── DataTablePlayer.tsx
│   ├── Dependencias:
│   │   ├── columns.tsx
│   │   ├── @/components/ui/table
│   │   └── PlayerType
│   └── Usado en:
│       └── app/(admin)/admin/players/page.tsx
└── index.tsx
    └── Exporta DataTablePlayer
```

### 🏆 Gestión de Equipos

```
TeamTable/
├── columns.tsx
│   ├── Dependencias:
│   │   ├── @/components/ui/table
│   │   ├── @/components/ui/button
│   │   └── @/components/ui/avatar
│   └── Usado en:
│       └── DataTableTeam.tsx
├── DataTableTeam.tsx
│   ├── Dependencias:
│   │   ├── columns.tsx
│   │   ├── @/components/ui/table
│   │   └── TeamType
│   └── Usado en:
│       └── app/(admin)/admin/teams/page.tsx
└── index.tsx
    └── Exporta DataTableTeam
```

```
TeamField.tsx
├── Dependencias:
│   ├── @/components/ui/select
│   ├── TeamType
│   └── @/components/ui/avatar
├── Usado en:
│   ├── components/admin/MatchForm.tsx
│   └── app/(admin)/admin/matches/new/page.tsx
└── Funcionalidades:
    └── Selección de equipos en formularios
```

```
TeamPlayersSection.tsx
├── Dependencias:
│   ├── PlayerMatchCard.tsx
│   ├── @/components/ui/card
│   ├── @/components/ui/avatar
│   └── PlayerType
├── Usado en:
│   └── app/(root)/members/players/[id]/page.tsx
└── Funcionalidades:
    └── Visualización de jugadores del equipo
```

### 🏠 Componentes de Páginas

```
LiveMatchPageClient.tsx
├── Dependencias:
│   ├── useLiveMatch (hook)
│   ├── @/components/members/LiveMatchHeader.tsx
│   ├── @/components/members/LiveMatchScoreCard.tsx
│   ├── @/components/members/LiveMatchTimeline.tsx
│   └── @/components/members/LiveMatchVideoStream.tsx
├── Usado en:
│   └── app/(admin)/admin/matches/live/[id]/page.tsx
└── Funcionalidades críticas:
    ├── Gestión de partidos en vivo
    ├── Actualización en tiempo real
    └── Streaming de video
```

```
LiveMatchViewer.tsx
├── Dependencias:
│   ├── useLiveMatch (hook)
│   ├── @/components/members/LiveMatchHeader.tsx
│   ├── @/components/members/LiveMatchScoreCard.tsx
│   ├── @/components/members/LiveMatchTimeline.tsx
│   └── @/components/members/LiveMatchVideoStream.tsx
├── Usado en:
│   └── app/(root)/members/matches/live/[id]/page.tsx
└── Funcionalidades críticas:
    ├── Visualización de partidos en vivo
    ├── Actualización en tiempo real
    └── Streaming de video
```

### 🎯 Hooks Personalizados

```
useLiveMatch.ts
├── Dependencias:
│   ├── Socket.io
│   ├── Redux store
│   └── React hooks
├── Usado en:
│   ├── LiveMatchPageClient.tsx
│   └── LiveMatchViewer.tsx
└── Funcionalidades:
    ├── Conexión Socket.io
    ├── Gestión de estado en vivo
    └── Actualizaciones en tiempo real
```

```
useDebounceCallback.tsx
├── Dependencias:
│   └── React hooks
├── Usado en:
│   └── Componentes de búsqueda
└── Funcionalidades:
    └── Debounce de callbacks
```

```
useSubmitForm.tsx
├── Dependencias:
│   ├── react-hook-form
│   └── React hooks
├── Usado en:
│   └── Formularios del proyecto
└── Funcionalidades:
    └── Manejo de envío de formularios
```

### 🔧 Server Actions

```
lib/actions/matches.action.ts
├── Dependencias:
│   ├── @/database/drizzle
│   ├── @/database/schema
│   └── drizzle-orm
├── Usado en:
│   ├── components/admin/MatchForm.tsx
│   └── Páginas de gestión de partidos
└── Funcionalidades:
    ├── CRUD de partidos
    ├── Estadísticas de jugadores
    └── Datos en vivo
```

```
lib/actions/player.action.ts
├── Dependencias:
│   ├── @/database/drizzle
│   ├── @/database/schema
│   └── @/lib/utils/cloudinaryUpload
├── Usado en:
│   ├── components/admin/PlayerForm.tsx
│   └── Páginas de gestión de jugadores
└── Funcionalidades:
    ├── CRUD de jugadores
    ├── Subida de avatares
    └── Asignación a equipos
```

```
lib/actions/streaming.action.ts
├── Dependencias:
│   ├── @/database/drizzle
│   ├── @/database/schema
│   └── Socket.io
├── Usado en:
│   ├── StreamBroadcaster.tsx
│   └── StreamViewer.tsx
└── Funcionalidades:
    ├── Gestión de streams
    ├── Conexiones WebRTC
    └── Estados de transmisión
```

### 🗄️ Base de Datos

```
database/schema.ts
├── Tablas críticas:
│   ├── matches
│   ├── players
│   ├── teams
│   ├── organizations
│   ├── liveMatchData
│   ├── liveMatchScore
│   ├── matchEvents
│   └── playerStats
├── Usado en:
│   └── Todos los server actions
└── Funcionalidades:
    ├── Definición de esquema
    ├── Relaciones entre tablas
    └── Tipos de datos
```

### 🎨 Componentes UI Base

```
components/ui/
├── button.tsx
│   ├── Dependencias:
│   │   ├── class-variance-authority
│   │   └── lucide-react
│   └── Usado en: MUCHOS COMPONENTES
├── card.tsx
│   ├── Dependencias:
│   │   └── class-variance-authority
│   └── Usado en: MUCHOS COMPONENTES
├── avatar.tsx
│   ├── Dependencias:
│   │   └── @radix-ui/react-avatar
│   └── Usado en: MUCHOS COMPONENTES
├── table.tsx
│   ├── Dependencias:
│   │   └── @radix-ui/react-slot
│   └── Usado en: TODAS LAS TABLAS
└── dialog.tsx
    ├── Dependencias:
    │   └── @radix-ui/react-dialog
    └── Usado en: MODALES
```

## ⚠️ Reglas de Modificación

### Antes de modificar un componente:

1. **Buscar dependencias:**

   ```bash
   # Buscar imports del componente
   grep -r "import.*ComponentName" .

   # Buscar usos del componente
   grep -r "<ComponentName" .
   ```

2. **Verificar tipos:**

   ```bash
   # Buscar definición de tipo
   grep -r "interface.*TypeName\|type.*TypeName" .

   # Buscar usos del tipo
   grep -r "TypeName" .
   ```

3. **Revisar tests:**
   ```bash
   # Buscar tests del componente
   find . -name "*.test.tsx" -exec grep -l "ComponentName" {} \;
   ```

### Componentes CRÍTICOS (NO MODIFICAR SIN REVISIÓN):

1. **MatchEvent (type)** - Usado por todo el sistema de calendario
2. **useLiveMatch (hook)** - Usado por partidos en vivo
3. **useVideoStream (hook)** - Usado por streaming
4. **database/schema.ts** - Base de toda la aplicación
5. **components/ui/** - Base de todos los componentes

### Patrones de Modificación Segura:

```typescript
// ✅ Correcto - Extender sin romper
interface ExistingType {
  id: string
  name: string
}

// Agregar campo opcional
interface ExtendedType extends ExistingType {
  newField?: string
}

// ❌ Incorrecto - Modificar tipo existente
interface ExistingType {
  id: string
  name: string
  newField: string // Requerido - ROMPE CÓDIGO EXISTENTE
}
```

```typescript
// ✅ Correcto - Agregar prop opcional
interface ComponentProps {
  existingProp: string
  newProp?: string // Opcional
}

// ❌ Incorrecto - Hacer prop requerido
interface ComponentProps {
  existingProp: string
  newProp: string // Requerido - ROMPE USOS EXISTENTES
}
```

## 🔍 Comandos de Búsqueda Útiles

```bash
# Buscar todos los usos de un componente
grep -r "ComponentName" . --include="*.tsx" --include="*.ts"

# Buscar imports específicos
grep -r "import.*from.*ComponentName" .

# Buscar en tests
find . -name "*.test.tsx" -exec grep -l "ComponentName" {} \;

# Buscar tipos
grep -r "interface.*TypeName\|type.*TypeName" .

# Buscar en server actions
find . -path "*/actions/*" -name "*.ts" -exec grep -l "ComponentName" {} \;
```

## 📋 Checklist Antes de Modificar

- [ ] Buscar todos los usos del componente
- [ ] Verificar tipos relacionados
- [ ] Revisar tests existentes
- [ ] Probar en desarrollo
- [ ] Ejecutar `npm run lint`
- [ ] Ejecutar `npm run build`
- [ ] Verificar funcionalidad específica
- [ ] Documentar cambios

---

**Nota**: Este mapa debe actualizarse cada vez que se agreguen nuevos componentes o se modifiquen dependencias existentes.
