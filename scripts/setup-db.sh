#!/bin/bash

echo "🚀 Configurando base de datos para Soccer App..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está disponible
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose no está disponible. Por favor instala Docker Compose primero."
    exit 1
fi

echo "✅ Docker y Docker Compose están instalados"

# Crear archivo .env.local si no existe
if [ ! -f .env.local ]; then
    echo "📝 Creando archivo .env.local..."
    cp env.example .env.local
    echo "✅ Archivo .env.local creado"
else
    echo "✅ Archivo .env.local ya existe"
fi

# Iniciar los contenedores
echo "🐳 Iniciando contenedores de PostgreSQL..."
docker compose up -d

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
npm run db:migrate

# Ejecutar seed si existe
if [ -f "database/seed.ts" ]; then
    echo "🌱 Ejecutando seed de la base de datos..."
    npm run db:seed
fi

echo "✅ Base de datos configurada exitosamente!"
echo ""
echo "📊 Información de conexión:"
echo "   - Base de datos: PostgreSQL"
echo "   - Host: localhost"
echo "   - Puerto: 5432"
echo "   - Base de datos: soccer_app"
echo "   - Usuario: soccer_user"
echo "   - Contraseña: soccer_password"
echo ""
echo "🌐 PgAdmin (interfaz web):"
echo "   - URL: http://localhost:8080"
echo "   - Email: admin@soccer.com"
echo "   - Contraseña: admin123"
echo ""
echo "🚀 Para iniciar la aplicación:"
echo "   npm run dev" 