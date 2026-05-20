const express = require('express')
const router = express.Router()
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const { signToken, signRefreshToken, authenticate } = require('../middleware/auth')
const { body, validationResult } = require('express-validator')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'Email already registered' })

    const user = await User.create({ name, email, password })
    const token = signToken(user._id)
    const refreshToken = signRefreshToken(user._id)

    res.status(201).json({
      message: 'Account created successfully',
      token,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan },
    })
  } catch (err) { next(err) }
})

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user?.password) return res.status(401).json({ error: 'Invalid credentials' })

    const isMatch = await user.comparePassword(password)
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' })

    user.lastLoginAt = new Date()
    await user.save()

    const token = signToken(user._id)
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, isAdmin: user.isAdmin },
    })
  } catch (err) { next(err) }
})

// POST /api/auth/google
router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    const { sub: googleId, email, name, picture } = payload

    let user = await User.findOne({ $or: [{ googleId }, { email }] })

    if (!user) {
      user = await User.create({ name, email, googleId, avatar: picture, isVerified: true })
    } else if (!user.googleId) {
      user.googleId = googleId
      user.avatar = picture
      await user.save()
    }

    user.lastLoginAt = new Date()
    await user.save()

    const token = signToken(user._id)
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar },
    })
  } catch (err) { next(err) }
})

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user })
})

// POST /api/auth/logout
router.post('/logout', (req, res) => res.json({ message: 'Logged out' }))

module.exports = router