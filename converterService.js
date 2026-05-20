const path = require('path')
const fs = require('fs').promises
const { v4: uuidv4 } = require('uuid')
const sharp = require('sharp')
const { PDFDocument } = require('pdf-lib')
const mammoth = require('mammoth')
const Tesseract = require('tesseract.js')
const archiver = require('archiver')
const ffmpeg = require('fluent-ffmpeg')

const OUTPUT_DIR = path.join(__dirname, '../outputs')

const converterService = {
  /**
   * Main dispatcher — routes to the correct conversion handler
   */
  async convert({ files, tool, options, jobId }) {
    await fs.mkdir(OUTPUT_DIR, { recursive: true })

    const dispatch = {
      'pdf-to-word': this.pdfToWord,
      'word-to-pdf': this.wordToPdf,
      'pdf-to-jpg': this.pdfToJpg,
      'jpg-to-pdf': this.jpgToPdf,
      'merge-pdf': this.mergePdf,
      'split-pdf': this.splitPdf,
      'compress-pdf': this.compressPdf,
      'rotate-pdf': this.rotatePdf,
      'protect-pdf': this.protectPdf,
      'unlock-pdf': this.unlockPdf,
      'watermark-pdf': this.watermarkPdf,
      'ocr-pdf': this.ocrPdf,
      'png-to-jpg': this.pngToJpg,
      'jpg-to-png': this.jpgToPng,
      'image-compressor': this.compressImage,
      'audio-converter': this.convertAudio,
      'video-converter': this.convertVideo,
    }

    const handler = dispatch[tool]
    if (!handler) throw new Error(`Unknown tool: ${tool}`)

    return handler.call(this, { files, options, jobId })
  },

  /**
   * PDF to JPG — convert each page to an image using pdf2pic
   */
  async pdfToJpg({ files, options, jobId }) {
    const { fromPath } = require('pdf2pic')
    const results = []

    for (const file of files) {
      const convert = fromPath(file.path, {
        density: parseInt(options.dpi) || 200,
        saveFilename: uuidv4(),
        savePath: OUTPUT_DIR,
        format: 'jpg',
        width: 2480,
        height: 3508,
      })

      const pages = options.allPages ? 'all' : 1
      const result = await convert(pages)
      results.push(...(Array.isArray(result) ? result : [result]))
    }

    return this.packageOutput(results.map(r => r.path), jobId)
  },

  /**
   * JPG to PDF — combine images into a PDF
   */
  async jpgToPdf({ files, options, jobId }) {
    const pdfDoc = await PDFDocument.create()

    for (const file of files) {
      const imageBytes = await fs.readFile(file.path)
      const ext = path.extname(file.originalname).toLowerCase()
      const image = ext === '.png' ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes)

      const pageSize = options.pageSize === 'A4' ? [595, 842] : [612, 792]
      const page = pdfDoc.addPage(pageSize)
      const { width, height } = page.getSize()

      const scale = Math.min(width / image.width, height / image.height)
      page.drawImage(image, {
        x: (width - image.width * scale) / 2,
        y: (height - image.height * scale) / 2,
        width: image.width * scale,
        height: image.height * scale,
      })
    }

    const outputPath = path.join(OUTPUT_DIR, `${jobId}.pdf`)
    await fs.writeFile(outputPath, await pdfDoc.save())
    return { outputPath, outputSize: (await fs.stat(outputPath)).size }
  },

  /**
   * Merge PDF — combine multiple PDFs
   */
  async mergePdf({ files, options, jobId }) {
    const mergedPdf = await PDFDocument.create()

    for (const file of files) {
      const bytes = await fs.readFile(file.path)
      const doc = await PDFDocument.load(bytes)
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices())
      pages.forEach(page => mergedPdf.addPage(page))
    }

    if (options.pageNumbers) {
      // Add page numbers (simplified)
      const { rgb, StandardFonts } = require('pdf-lib')
      const font = await mergedPdf.embedFont(StandardFonts.Helvetica)
      mergedPdf.getPages().forEach((page, i) => {
        page.drawText(`${i + 1}`, { x: page.getWidth() / 2, y: 20, font, size: 10, color: rgb(0.5, 0.5, 0.5) })
      })
    }

    const outputPath = path.join(OUTPUT_DIR, `${jobId}.pdf`)
    await fs.writeFile(outputPath, await mergedPdf.save())
    return { outputPath, outputSize: (await fs.stat(outputPath)).size }
  },

  /**
   * Compress PDF
   */
  async compressPdf({ files, options, jobId }) {
    const file = files[0]
    const bytes = await fs.readFile(file.path)
    const doc = await PDFDocument.load(bytes)

    // Compress using pdf-lib options
    const compressed = await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    })

    const outputPath = path.join(OUTPUT_DIR, `${jobId}.pdf`)
    await fs.writeFile(outputPath, compressed)
    return { outputPath, outputSize: (await fs.stat(outputPath)).size }
  },

  /**
   * OCR PDF using Tesseract.js
   */
  async ocrPdf({ files, options, jobId }) {
    const file = files[0]
    const worker = await Tesseract.createWorker(options.language || 'eng')

    const { data: { text } } = await worker.recognize(file.path)
    await worker.terminate()

    const outputPath = path.join(OUTPUT_DIR, `${jobId}.txt`)
    await fs.writeFile(outputPath, text)
    return { outputPath, outputSize: (await fs.stat(outputPath)).size }
  },

  /**
   * Image compression using Sharp
   */
  async compressImage({ files, options, jobId }) {
    const outputs = []

    for (const file of files) {
      const quality = options.quality === 'Auto (AI)' ? 80 : parseInt(options.quality) || 80
      const outputName = `${uuidv4()}${path.extname(file.originalname)}`
      const outputPath = path.join(OUTPUT_DIR, outputName)

      let pipeline = sharp(file.path)

      if (options.format === 'Convert to WebP') {
        pipeline = pipeline.webp({ quality })
      } else if (options.format === 'Convert to AVIF') {
        pipeline = pipeline.avif({ quality })
      } else {
        const ext = path.extname(file.originalname).toLowerCase()
        if (ext === '.jpg' || ext === '.jpeg') pipeline = pipeline.jpeg({ quality })
        else if (ext === '.png') pipeline = pipeline.png({ compressionLevel: Math.floor((100 - quality) / 10) })
      }

      await pipeline.toFile(outputPath)
      outputs.push(outputPath)
    }

    return this.packageOutput(outputs, jobId)
  },

  /**
   * Audio conversion using FFmpeg
   */
  async convertAudio({ files, options, jobId }) {
    const file = files[0]
    const format = (options.format || 'mp3').toLowerCase()
    const outputPath = path.join(OUTPUT_DIR, `${jobId}.${format}`)

    return new Promise((resolve, reject) => {
      let cmd = ffmpeg(file.path).toFormat(format)

      if (options.bitrate) {
        const kbps = parseInt(options.bitrate.replace(' kbps', ''))
        cmd = cmd.audioBitrate(kbps)
      }

      cmd.on('end', async () => {
        resolve({ outputPath, outputSize: (await fs.stat(outputPath)).size })
      })
        .on('error', reject)
        .save(outputPath)
    })
  },

  /**
   * Video conversion using FFmpeg
   */
  async convertVideo({ files, options, jobId }) {
    const file = files[0]
    const format = (options.format || 'mp4').toLowerCase()
    const outputPath = path.join(OUTPUT_DIR, `${jobId}.${format}`)

    return new Promise((resolve, reject) => {
      let cmd = ffmpeg(file.path).toFormat(format)

      if (options.resolution && options.resolution !== 'Original') {
        const resMap = { '4K (2160p)': '3840x2160', '1080p': '1920x1080', '720p': '1280x720', '480p': '854x480', '360p': '640x360' }
        const size = resMap[options.resolution]
        if (size) cmd = cmd.size(size)
      }

      if (options.compress) cmd = cmd.videoBitrate('1000k').audioBitrate('128k')

      cmd.on('end', async () => {
        resolve({ outputPath, outputSize: (await fs.stat(outputPath)).size })
      })
        .on('error', reject)
        .save(outputPath)
    })
  },

  /**
   * Word to PDF using LibreOffice (headless)
   */
  async wordToPdf({ files, options, jobId }) {
    const { exec } = require('child_process').promises || require('util').promisify(require('child_process').exec)
    const file = files[0]

    // LibreOffice headless conversion
    await exec(`libreoffice --headless --convert-to pdf --outdir "${OUTPUT_DIR}" "${file.path}"`)

    const outputName = path.basename(file.path, path.extname(file.path)) + '.pdf'
    const outputPath = path.join(OUTPUT_DIR, outputName)
    const finalPath = path.join(OUTPUT_DIR, `${jobId}.pdf`)
    await fs.rename(outputPath, finalPath)

    return { outputPath: finalPath, outputSize: (await fs.stat(finalPath)).size }
  },

  /**
   * Package multiple outputs into a ZIP
   */
  async packageOutput(filePaths, jobId) {
    if (filePaths.length === 1) {
      return { outputPath: filePaths[0], outputSize: (await fs.stat(filePaths[0])).size }
    }

    const zipPath = path.join(OUTPUT_DIR, `${jobId}.zip`)
    await new Promise((resolve, reject) => {
      const output = require('fs').createWriteStream(zipPath)
      const archive = archiver('zip', { zlib: { level: 9 } })
      archive.on('error', reject)
      output.on('close', resolve)
      archive.pipe(output)
      filePaths.forEach((fp, i) => archive.file(fp, { name: `file-${i + 1}${path.extname(fp)}` }))
      archive.finalize()
    })

    return { outputPath: zipPath, outputSize: (await fs.stat(zipPath)).size }
  },
}

module.exports = converterService