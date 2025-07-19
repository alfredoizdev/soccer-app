#!/bin/bash

echo "🚀 Aplicando migraciones en Neon..."

# Verificar que DATABASE_URL esté configurada
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL no está configurada"
    echo "Por favor, configura tu variable de entorno DATABASE_URL para Neon"
    exit 1
fi

# Aplicar migraciones
echo "📦 Aplicando migraciones..."
npm run db:migrate

if [ $? -eq 0 ]; then
    echo "✅ Migraciones aplicadas exitosamente en Neon"
else
    echo "❌ Error aplicando migraciones"
    exit 1
fi

echo "🎉 ¡Migraciones completadas!"
echo "📊 Tu base de datos Neon está lista para usar" 