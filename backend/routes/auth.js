 



import express from "express"
import User from "../models/User.js"
import { authenticateToken } from "../middleware/auth.js"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"

const router = express.Router()
router.use(cookieParser())

// Helper to set cookie
function setTokenCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24h
  })
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    const exists = await User.findOne({ $or: [{ email }, { username }] })
    if (exists) return res.status(400).json({ message: 'User exists' })

    const user = new User({ username, email, password })
    await user.save()

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' })
    setTokenCookie(res, token)

    res.status(201).json({ user: { id: user._id, username, email } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' })
    setTokenCookie(res, token)

    res.json({ user: { id: user._id, username: user.username, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
  res.status(200).json({ message: 'Logged out' })
})

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'Not found' })
    res.json({ id: user._id, username: user.username, email: user.email })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router