# Tests para Soccer App

## Configuración de Testing

Este proyecto usa **Vitest** + **React Testing Library** siguiendo las recomendaciones oficiales de Next.js para testing.

### Herramientas utilizadas:

- **Vitest**: Test runner moderno y rápido
- **React Testing Library**: Para testing de componentes React
- **@testing-library/jest-dom**: Aserciones extendidas para DOM
- **jsdom**: Entorno DOM para tests

### Configuración:

- `vitest.config.ts`: Configuración principal con alias de path
- `vitest.setup.ts`: Setup con jest-dom para aserciones extendidas

## Estructura de Tests

### Tests Implementados:

#### 1. **Hook Tests** (`__tests__/hooks/`)

- `useLiveMatch.test.tsx`: Tests para el hook crítico de live match
  - ✅ Inicialización con stats y score
  - ✅ Actualización de stats con debouncing
  - ✅ Toggle de estado de jugador
  - ✅ Actualización de score
  - ✅ Manejo de errores
  - ✅ Finalización de partido
  - ✅ Actualización de tiempo jugado
  - ✅ Guardado periódico de stats

#### 2. **Server Actions Tests** (`__tests__/actions/`)

- `matches.action.test.tsx`: Tests para server actions de matches
  - ✅ getLiveMatchData
  - ✅ initializeLiveMatchData
  - ✅ updateLivePlayerStats
  - ✅ updateLiveMatchScore
  - ✅ endLiveMatch

#### 3. **Component Tests** (`__tests__/components/`)

- `LiveMatchPageClient.test.tsx`: Tests para el componente principal de live match
  - ✅ Renderizado de título y equipos
  - ✅ Display de score
  - ✅ Botones de selección de equipo
  - ✅ Controles de timer
  - ✅ Renderizado de jugadores
  - ✅ Cambio de equipos
  - ✅ Toggle de jugadores
  - ✅ Actualización de stats de jugadores
  - ✅ Stats de portero
  - ✅ Controles de timer
  - ✅ Finalización de partido
  - ✅ Indicador de actualizaciones pendientes

#### 4. **Test de Validación**

- `hello-vitest.test.tsx`: Test de ejemplo para validar configuración

## Comandos Disponibles

```bash
npm run test          # Ejecutar tests una vez
npm run test:watch    # Ejecutar tests en modo watch
npm run test:ui       # Ejecutar tests con UI de Vitest
npm run test:coverage # Ejecutar tests con cobertura
```

## Cobertura de Testing

### Funcionalidades Críticas Cubiertas:

1. **Live Match Hook** (`useLiveMatch`)

   - ✅ Gestión de estado de jugadores
   - ✅ Debouncing de actualizaciones
   - ✅ Manejo de errores de API
   - ✅ Timer y actualizaciones periódicas
   - ✅ Finalización de partido

2. **Server Actions**

   - ✅ Operaciones de base de datos
   - ✅ Manejo de errores
   - ✅ Validaciones

3. **Componente LiveMatchPageClient**
   - ✅ Renderizado correcto
   - ✅ Interacciones de usuario
   - ✅ Integración con hook
   - ✅ Estados de UI

## Mejoras Pendientes

### 1. Optimización de Tests de Hooks

- Ajustar timeouts para tests con timers
- Mejorar mocks de timers

### 2. Mejora de Mocks de Base de Datos

- Crear mocks más específicos para Drizzle
- Mejorar cobertura de casos edge

### 3. Tests de Integración

- Agregar tests de flujos completos
- Tests de E2E con Playwright (futuro)

## Mejores Prácticas Seguidas

1. **Arrange-Act-Assert**: Estructura clara en todos los tests
2. **Mocks Específicos**: Solo mockear lo necesario
3. **Tests Aislados**: Cada test es independiente
4. **Nombres Descriptivos**: Tests fáciles de entender
5. **Cobertura de Casos Edge**: Tests de errores y edge cases

## Configuración de Vitest

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

## Próximos Pasos

1. **Corregir timeouts** en tests de hooks
2. **Mejorar mocks** de base de datos
3. **Agregar tests de integración**
4. **Implementar E2E testing** con Playwright
5. **Agregar tests de performance**

---

_Configurado siguiendo las recomendaciones oficiales de Next.js para testing con Vitest y React Testing Library._
