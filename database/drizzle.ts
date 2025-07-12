import * as schema from './schema'
import config from '@/lib/config'

const isProduction = process.env.NODE_ENV === 'production'

// Exporta una promesa de db para soportar imports dinámicos
export const dbPromise = (async () => {
  if (isProduction) {
    // Producción: Neon
    const { drizzle } = await import('drizzle-orm/neon-http')
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(config.databaseUrl!)
    return drizzle(sql, { schema })
  } else {
    // Desarrollo: PostgreSQL local
    const { drizzle } = await import('drizzle-orm/node-postgres')
    const { Pool } = await import('pg')
    const pool = new Pool({ connectionString: config.databaseUrl })
    return drizzle(pool, { schema })
  }
})()

// Uso: const db = await dbPromise
