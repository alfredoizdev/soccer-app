-- Crear los enums necesarios para la aplicación
CREATE TYPE status AS ENUM ('active', 'inactive');
CREATE TYPE role AS ENUM ('admin', 'user');

-- Crear la base de datos si no existe
-- (PostgreSQL crea la base de datos automáticamente con las variables de entorno) 