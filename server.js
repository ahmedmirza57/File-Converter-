const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config()

const app = express()

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
})
const convertLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 conversions/hour for free users
  keyGenerator: (req) => req.user?.id || req.ip,
})

app.use('/api/', apiLimiter)

// Static files (uploads/downloads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/outputs', express.static(path.join(__dirname, 'outputs')))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/convert', convertLimiter, require('./routes/convert'))
app.use('/api/files', require('./routes/files'))
app.use('/api/user', require('./routes/user'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/plans', require('./routes/plans'))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// Connect MongoDB and start server
const PORT = process.env.PORT || 5000
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => console.log(`🚀 FileFlux API running on port ${PORT}`))
  })
  .catch(err => { console.error('MongoDB connection failed:', err); process.exit(1) })

module.exports = app