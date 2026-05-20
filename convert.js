const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { authenticate, optionalAuth } = require('../middleware/auth')
const { checkPlanLimits } = require('../middleware/planLimits')
const converterService = require('../services/converterService')
const File = require('../models/File')

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`),
})
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|gif|webp|mp3|mp4|wav|flac|avi|mov|mkv|xlsx|pptx|html/
    const ext = path.extname(file.originalname).toLowerCase().slice(1)
    allowedTypes.test(ext) ? cb(null, true) : cb(new Error('File type not supported'))
  }
})

// POST /api/convert — Main conversion endpoint
router.post('/', optionalAuth, checkPlanLimits, upload.array('files', 20), async (req, res, next) => {
  const { tool, options } = req.body
  const files = req.files

  if (!files?.length) return res.status(400).json({ error: 'No files uploaded' })
  if (!tool) return res.status(400).json({ error: 'Conversion tool not specified' })

  const jobId = uuidv4()
  let parsedOptions = {}

  try {
    parsedOptions = options ? JSON.parse(options) : {}
  } catch {
    return res.status(400).json({ error: 'Invalid options format' })
  }

  // Save job to DB
  const fileRecords = await File.insertMany(files.map(f => ({
    userId: req.user?.id || null,
    originalName: f.originalname,
    storedName: f.filename,
    size: f.size,
    mimeType: f.mimetype,
    jobId,
    tool,
    status: 'processing',
    expiresAt: new Date(Date.now() + 3600000), // 1 hour
  })))

  // Stream progress via SSE (simplified: use polling or WebSocket in production)
  res.status(202).json({ jobId, message: 'Processing started', fileCount: files.length })

  // Async processing
  try {
    const result = await converterService.convert({ files, tool, options: parsedOptions, jobId })

    await File.updateMany({ jobId }, {
      status: 'done',
      outputPath: result.outputPath,
      outputSize: result.outputSize,
    })
  } catch (err) {
    await File.updateMany({ jobId }, { status: 'error', errorMessage: err.message })
    console.error('Conversion error:', err)
  }
})

// GET /api/convert/status/:jobId — Poll conversion status
router.get('/status/:jobId', async (req, res) => {
  const files = await File.find({ jobId: req.params.jobId })
  if (!files.length) return res.status(404).json({ error: 'Job not found' })

  const file = files[0]
  const response = {
    jobId: req.params.jobId,
    status: file.status,
    fileCount: files.length,
  }

  if (file.status === 'done') {
    response.downloadUrl = `${process.env.API_BASE_URL}/outputs/${file.jobId}.zip`
    response.outputSize = file.outputSize
  }
  if (file.status === 'error') {
    response.error = file.errorMessage
  }

  res.json(response)
})

// GET /api/convert/download/:jobId — Download result
router.get('/download/:jobId', async (req, res) => {
  const file = await File.findOne({ jobId: req.params.jobId, status: 'done' })
  if (!file) return res.status(404).json({ error: 'File not ready or not found' })
  if (new Date() > file.expiresAt) return res.status(410).json({ error: 'Download link has expired' })

  const outputPath = path.join(__dirname, '../outputs', `${req.params.jobId}.zip`)
  res.download(outputPath, `fileflux-${file.tool}-output.zip`)
})

module.exports = router