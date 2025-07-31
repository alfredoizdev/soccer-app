# Guía de Desarrollo - Soccer App

## 🚀 Inicio Rápido

### Antes de Modificar Cualquier Componente

1. **Revisar la documentación:**

   - `PROJECT_DOCUMENTATION.md` - Documentación general del proyecto
   - `DEPENDENCY_MAP.md` - Mapa detallado de dependencias

2. **Buscar dependencias del componente:**

   ```bash
   # Para componentes
   npm run find:deps component NombreDelComponente

   # Para tipos
   npm run find:deps type NombreDelTipo
   ```

3. **Ejemplos de uso:**

   ```bash
   # Buscar dependencias del calendario móvil
   npm run find:deps component MatchCalendarMobile

   # Buscar dependencias del tipo MatchEvent
   npm run find:deps type MatchEvent
   ```

## 📋 Checklist de Desarrollo

### Antes de Hacer Cambios

- [ ] Revisar `PROJECT_DOCUMENTATION.md`
- [ ] Revisar `DEPENDENCY_MAP.md`
- [ ] Buscar dependencias con `npm run find:deps`
- [ ] Verificar tests existentes
- [ ] Probar en desarrollo

### Después de Hacer Cambios

- [ ] Ejecutar `npm run lint`
- [ ] Ejecutar `npm run build`
- [ ] Ejecutar `npm run test`
- [ ] Probar funcionalidad específica
- [ ] Actualizar documentación si es necesario

## 🎯 Componentes Críticos

### NO MODIFICAR SIN REVISIÓN COMPLETA

1. **`MatchEvent` (type)** - Usado por todo el sistema de calendario
2. **`useLiveMatch` (hook)** - Usado por partidos en vivo
3. **`useVideoStream` (hook)** - Usado por streaming
4. **`database/schema.ts`** - Base de toda la aplicación
5. **`components/ui/`** - Base de todos los componentes

### Patrones de Modificación Segura

```typescript
// ✅ Correcto - Agregar campo opcional
interface ExistingType {
  id: string
  name: string
  newField?: string // Opcional
}

// ❌ Incorrecto - Hacer campo requerido
interface ExistingType {
  id: string
  name: string
  newField: string // Requerido - ROMPE CÓDIGO EXISTENTE
}
```

## 🔧 Comandos Útiles

### Desarrollo

```bash
# Iniciar desarrollo
npm run dev

# Build
npm run build

# Lint
npm run lint

# Tests
npm run test
npm run test:watch
```

### Base de Datos

```bash
# Generar migración
npm run db:generate

# Ejecutar migración
npm run db:migrate

# Ver estado
npm run db:studio
```

### Búsqueda de Dependencias

```bash
# Buscar dependencias de componente
npm run find:deps component NombreComponente

# Buscar dependencias de tipo
npm run find:deps type NombreTipo
```

## 📚 Documentación

### Archivos de Documentación

- **`PROJECT_DOCUMENTATION.md`** - Documentación completa del proyecto
- **`DEPENDENCY_MAP.md`** - Mapa detallado de dependencias
- **`README_DEVELOPMENT.md`** - Esta guía de desarrollo

### Estructura de Documentación

```
📁 Documentación
├── PROJECT_DOCUMENTATION.md    # Documentación general
├── DEPENDENCY_MAP.md          # Mapa de dependencias
├── README_DEVELOPMENT.md      # Guía de desarrollo
└── scripts/
    └── find-dependencies.js   # Script de búsqueda
```

## 🚨 Reglas Importantes

### NO HACER

- ❌ Modificar tipos existentes sin verificar impacto
- ❌ Usar HTML nativo en lugar de componentes UI
- ❌ Cambiar estructura de datos sin migración
- ❌ Usar `any` type
- ❌ Commitear sin probar build

### SÍ HACER

- ✅ Verificar dependencias antes de modificar
- ✅ Usar componentes de shadcn/ui
- ✅ Crear migraciones para cambios de DB
- ✅ Usar TypeScript strict mode
- ✅ Probar build antes de commit

## 🆘 Solución de Problemas

### Si Rompiste Algo

1. **Revisar logs:**

   ```bash
   npm run lint
   npm run build
   ```

2. **Buscar dependencias rotas:**

   ```bash
   npm run find:deps component ComponenteRoto
   ```

3. **Revertir cambios:**

   ```bash
   git checkout -- archivo/roto.tsx
   ```

4. **Verificar tests:**
   ```bash
   npm run test
   ```

### Comandos de Debug

```bash
# Ver errores de TypeScript
npx tsc --noEmit

# Ver errores de ESLint
npm run lint

# Ver errores de build
npm run build

# Ver tests fallando
npm run test
```

## 📞 Soporte

### Antes de Pedir Ayuda

1. Revisar esta documentación
2. Buscar dependencias con `npm run find:deps`
3. Verificar tests existentes
4. Probar en desarrollo
5. Ejecutar lint y build

### Información Necesaria

Cuando reportes un problema, incluye:

- Componente afectado
- Error específico
- Pasos para reproducir
- Resultado de `npm run find:deps`
- Logs de lint/build

---

**Recuerda**: Siempre revisar la documentación antes de hacer cambios importantes. Es mejor prevenir que curar.
