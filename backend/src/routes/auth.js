import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from '../db/index.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod'

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body
  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields are required' })

  try {
    const hash = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1,$2,$3) RETURNING id, username, email',
      [username.trim(), email.toLowerCase().trim(), hash]
    )
    const user = rows[0]
    await pool.query('INSERT INTO scores (user_id) VALUES ($1)', [user.id])
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user })
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'Username or email already taken' })
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' })

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()])
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Invalid email or password' })

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
