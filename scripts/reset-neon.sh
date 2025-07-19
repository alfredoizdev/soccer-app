#!/bin/bash

# Cargar variables de entorno desde .env.local si existe
if [ -f ".env.local" ]; then
    echo "📁 Cargando variables desde .env.local..."
    export $(grep -v '^#' .env.local | xargs)
fi

echo "🗑️  Haciendo drop completo de Neon..."

# Verificar que DATABASE_PRODUCTION_URL esté configurada
if [ -z "$DATABASE_PRODUCTION_URL" ]; then
    echo "❌ Error: DATABASE_PRODUCTION_URL no está configurada"
    echo "Por favor, configura tu variable de entorno DATABASE_PRODUCTION_URL para Neon"
    exit 1
fi

# Configurar DATABASE_URL para la migración
export DATABASE_URL="$DATABASE_PRODUCTION_URL"

# Ejecutar el script de drop
echo "🗑️  Ejecutando drop de tablas..."
psql "$DATABASE_URL" -f scripts/drop-neon-tables.sql

echo "✅ Drop completado"

# Aplicar migraciones limpias
echo "🚀 Aplicando migraciones limpias..."
npm run db:migrate

echo "🎉 ¡Neon reseteado exitosamente!"
echo "📊 Tu base de datos Neon está lista para usar" 