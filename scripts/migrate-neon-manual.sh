#!/bin/bash

echo "🚀 Migración manual a Neon"
echo "=========================="

# Pedir la URL de Neon
read -p "Ingresa tu URL de Neon (postgresql://...): " NEON_URL

if [ -z "$NEON_URL" ]; then
    echo "❌ Error: No se proporcionó URL"
    exit 1
fi

echo "📦 Ejecutando migraciones en Neon..."
echo "URL: $NEON_URL"

# Ejecutar migraciones con la URL proporcionada
DATABASE_URL="$NEON_URL" npm run db:migrate

echo "✅ Migraciones completadas!"
echo "🔍 Puedes verificar con: npm run db:studio" 