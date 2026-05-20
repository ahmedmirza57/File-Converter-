const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  jobId: { type: String, required: true, index: true },
  tool: { type: String, required: true },
  status: { type: String, enum: ['processing', 'done', 'error'], default: 'processing' },

  originalName: String,
  storedName: String,
  mimeType: String,
  size: Number, // bytes

  outputPath: String,
  outputSize: Number,
  errorMessage: String,

  options: { type: mongoose.Schema.Types.Mixed, default: {} },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }, // TTL index
}, { timestamps: true })

module.exports = mongoose.model('File', fileSchema)