const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 8 }, // null for OAuth users
  avatar: { type: String, default: null },
  googleId: { type: String, default: null },

  plan: {
    type: String,
    enum: ['free', 'pro', 'business'],
    default: 'free'
  },
  planExpiry: { type: Date, default: null },
  stripeCustomerId: { type: String, default: null },
  stripeSubscriptionId: { type: String, default: null },

  usage: {
    conversionsToday: { type: Number, default: 0 },
    lastConversionDate: { type: Date, default: null },
    totalConversions: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 }, // bytes
    apiRequestsThisMonth: { type: Number, default: 0 },
  },

  apiKey: { type: String, default: null },
  language: { type: String, default: 'en' },
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  lastLoginAt: { type: Date, default: null },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
})

// Virtual: plan limits
userSchema.virtual('limits').get(function () {
  const planLimits = {
    free:     { conversionsPerDay: 20, maxFileSizeMB: 25, apiRequestsPerMonth: 0 },
    pro:      { conversionsPerDay: Infinity, maxFileSizeMB: 500, apiRequestsPerMonth: 1000 },
    business: { conversionsPerDay: Infinity, maxFileSizeMB: 2048, apiRequestsPerMonth: 50000 },
  }
  return planLimits[this.plan]
})

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare passwords
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

// Reset daily usage
userSchema.methods.resetDailyUsageIfNeeded = function () {
  const today = new Date().toDateString()
  if (this.usage.lastConversionDate?.toDateString() !== today) {
    this.usage.conversionsToday = 0
  }
}

// Generate API key
userSchema.methods.generateApiKey = function () {
  const crypto = require('crypto')
  this.apiKey = 'ff_' + crypto.randomBytes(32).toString('hex')
}

userSchema.index({ email: 1 })
userSchema.index({ googleId: 1 })
userSchema.index({ apiKey: 1 })

module.exports = mongoose.model('User', userSchema)