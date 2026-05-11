import { Router } from 'express'
import { pool } from '../db/index.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/leaderboard', async (_, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.username, s.wins, s.losses, s.draws, s.games_played, s.best_streak
      FROM scores s
      JOIN users u ON u.id = s.user_id
      ORDER BY s.wins DESC, s.games_played ASC
      LIMIT 10
    `)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/me', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM scores WHERE user_id = $1', [req.user.userId])
    res.json(rows[0] || null)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/record', authenticate, async (req, res) => {
  const { result } = req.body
  if (!['win', 'loss', 'draw'].includes(result))
    return res.status(400).json({ error: "Result must be 'win', 'loss', or 'draw'" })

  const col = { win: 'wins', loss: 'losses', draw: 'draws' }[result]
  try {
    const { rows } = await pool.query(`
      UPDATE scores
      SET ${col} = ${col} + 1, games_played = games_played + 1, updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `, [req.user.userId])
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
