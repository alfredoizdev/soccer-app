const isProduction = process.env.NODE_ENV === 'production'

const config = {
  databaseUrl: isProduction
    ? process.env.DATABASE_PRODUCTION_URL
    : process.env.DATABASE_URL,
}

export default config
