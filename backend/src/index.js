import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import scoresRoutes from './routes/scores.js'
import { initDb } from './db/index.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/scores', scoresRoutes)
app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

initDb()
  .then(() => app.listen(PORT, () => console.log(`API running on :${PORT}`)))
  .catch(err => { console.error('Failed to start:', err); process.exit(1) })
