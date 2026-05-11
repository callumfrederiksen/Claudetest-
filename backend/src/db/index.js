import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { Pool } = pg
const __dir = dirname(fileURLToPath(import.meta.url))

export const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function initDb() {
  const schema = readFileSync(join(__dir, 'schema.sql'), 'utf8')
  await pool.query(schema)
  console.log('Database ready')
}
