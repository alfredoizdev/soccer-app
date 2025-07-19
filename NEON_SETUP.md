# 🚀 Configuración de Neon Database

## 📋 Pasos para configurar Neon

### 1. Crear cuenta en Neon

- Ve a [neon.tech](https://neon.tech)
- Crea una cuenta gratuita
- Crea un nuevo proyecto

### 2. Obtener la URL de conexión

- En tu proyecto de Neon, ve a "Connection Details"
- Copia la URL de conexión (algo como: `postgresql://user:password@ep-xxx.region.aws.neon.tech/database`)

### 3. Configurar variables de entorno

Crea un archivo `.env.local` con:

```bash
# Base de datos local (para desarrollo)
DATABASE_URL="postgresql://soccer_user:soccer_password@localhost:5432/soccer_app"

# Base de datos Neon (para producción)
DATABASE_URL_NEON="postgresql://user:password@ep-xxx.region.aws.neon.tech/database"
```

### 4. Aplicar migraciones en Neon

#### Opción A: Usando el script automático

```bash
# Configurar DATABASE_URL para Neon
export DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/database"

# Aplicar migraciones
npm run db:migrate:neon
```

#### Opción B: Manual

```bash
# Configurar DATABASE_URL
export DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/database"

# Aplicar migraciones
npm run db:migrate
```

### 5. Verificar la configuración

```bash
# Verificar que las tablas se crearon
npm run db:studio
```

## 📊 Estructura de la base de datos

### Tablas principales:

- `matches` - Partidos con campo `status` para filtrar activos/inactivos
- `players` - Jugadores
- `organizations` - Equipos/Organizaciones
- `player_stats` - Estadísticas por partido
- `match_events` - Eventos del partido (goles, asistencias, etc.)
- `live_match_data` - Datos en vivo del partido
- `live_match_score` - Marcador en vivo
- `users` - Usuarios del sistema

### Campos importantes:

- `matches.status`: `'active'` (partidos en curso) o `'inactive'` (terminados)
- `users.role`: `'admin'` o `'user'`
- `users.status`: `'active'` o `'inactive'`

## 🔧 Comandos útiles

```bash
# Generar nuevas migraciones
npm run db:generate

# Aplicar migraciones locales
npm run db:migrate

# Aplicar migraciones en Neon
npm run db:migrate:neon

# Abrir Drizzle Studio
npm run db:studio

# Ejecutar seed (datos de prueba)
npm run db:seed
```

## 🚨 Notas importantes

1. **Siempre haz backup** antes de aplicar migraciones en producción
2. **Prueba las migraciones** en local antes de aplicarlas en Neon
3. **Verifica la estructura** después de aplicar migraciones
4. **El campo `status` en `matches`** es crucial para filtrar partidos activos

## 🎯 Funcionalidades implementadas

- ✅ **Matches con estado** (activo/inactivo)
- ✅ **Filtrado automático** de matches terminados
- ✅ **End Match** marca como inactivo
- ✅ **Lista de matches** solo muestra activos
- ✅ **Historial** muestra todos los matches
