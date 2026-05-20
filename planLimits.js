const User = require('../models/User')

exports.checkPlanLimits = async (req, res, next) => {
  if (!req.user) {
    // Anonymous users: allow but track by IP
    return next()
  }

  const user = req.user
  user.resetDailyUsageIfNeeded()

  const { conversionsPerDay, maxFileSizeMB } = user.limits
  const totalSize = req.headers['content-length']
    ? parseInt(req.headers['content-length']) / 1024 / 1024
    : 0

  if (totalSize > maxFileSizeMB) {
    return res.status(413).json({
      error: `File size exceeds your plan limit (${maxFileSizeMB}MB). Please upgrade.`,
      upgradeUrl: '/pricing',
    })
  }

  if (conversionsPerDay !== Infinity && user.usage.conversionsToday >= conversionsPerDay) {
    return res.status(429).json({
      error: `Daily conversion limit reached (${conversionsPerDay}/day). Upgrade for unlimited conversions.`,
      resetAt: new Date(new Date().setHours(24, 0, 0, 0)),
      upgradeUrl: '/pricing',
    })
  }

  // Increment usage
  user.usage.conversionsToday += 1
  user.usage.totalConversions += 1
  user.usage.lastConversionDate = new Date()
  await user.save()

  next()
}