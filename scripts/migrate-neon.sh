#!/bin/bash

# Cargar variables de entorno desde .env.local
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Script para ejecutar migraciones en Neon
echo "🚀 Ejecutando migraciones en Neon..."

# Verificar que DATABASE_PRODUCTION_URL esté configurada
if [ -z "$DATABASE_PRODUCTION_URL" ]; then
    echo "❌ Error: DATABASE_PRODUCTION_URL no está configurada"
    echo "Por favor, configura la variable de entorno DATABASE_PRODUCTION_URL en .env.local"
    exit 1
fi

# Ejecutar migraciones usando la URL de producción
echo "📦 Ejecutando migraciones..."
echo "URL: $DATABASE_PRODUCTION_URL"
DATABASE_URL="$DATABASE_PRODUCTION_URL" npm run db:migrate

echo "✅ Migraciones completadas!" 