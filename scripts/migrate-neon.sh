#!/bin/bash

# Cargar variables de entorno desde .env.local si existe
if [ -f ".env.local" ]; then
    echo "📁 Cargando variables desde .env.local..."
    export $(grep -v '^#' .env.local | xargs)
fi

echo "🚀 Aplicando migraciones en Neon..."

# Verificar que DATABASE_PRODUCTION_URL esté configurada
if [ -z "$DATABASE_PRODUCTION_URL" ]; then
    echo "❌ Error: DATABASE_PRODUCTION_URL no está configurada"
    echo "Por favor, configura tu variable de entorno DATABASE_PRODUCTION_URL para Neon"
    exit 1
fi

# Configurar DATABASE_URL para la migración
export DATABASE_URL="$DATABASE_PRODUCTION_URL"

# Aplicar migraciones usando push para sincronizar esquema
echo "📦 Sincronizando esquema con Neon..."
npx drizzle-kit push

if [ $? -eq 0 ]; then
    echo "✅ Migraciones aplicadas exitosamente en Neon"
else
    echo "❌ Error aplicando migraciones"
    exit 1
fi

echo "🎉 ¡Migraciones completadas!"
echo "📊 Tu base de datos Neon está lista para usar" 