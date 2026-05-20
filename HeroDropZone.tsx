'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Upload, File, X } from 'lucide-react'
import toast from 'react-hot-toast'

const FORMAT_BADGES = ['PDF', 'DOCX', 'JPG', 'MP4', 'XLSX', 'PNG', 'MP3', 'PPTX']

export default function HeroDropZone() {
  const [files, setFiles] = useState<File[]>([])
  const router = useRouter()

  const onDrop = useCallback((accepted: File[]) => {
    setFiles(prev => [...prev, ...accepted])
    toast.success(`${accepted.length} file(s) added!`)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 100 * 1024 * 1024, // 100MB
    onDropRejected: () => toast.error('File too large. Max size is 100MB for free plan.'),
  })

  const removeFile = (idx: number) => setFiles(f => f.filter((_, i) => i !== idx))

  const handleConvert = () => {
    if (!files.length) return toast.error('Please add at least one file.')
    router.push('/tools?files=ready')
  }

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <motion.div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
          isDragActive
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-white/15 bg-white/3 hover:border-purple-500/50 hover:bg-purple-500/5'
        }`}
        whileHover={{ scale: 1.01 }}
      >
        <input {...getInputProps()} />
        <motion.div animate={{ y: isDragActive ? -8 : 0 }} transition={{ type: 'spring' }}>
          <Upload className="mx-auto mb-4 text-purple-400" size={48} strokeWidth={1.5} />
          <h3 className="mb-2 text-xl font-bold">
            {isDragActive ? 'Drop files here!' : 'Drop files here or click to upload'}
          </h3>
          <p className="mb-4 text-sm text-white/50">
            Supports PDF, Word, Excel, PowerPoint, Images, Audio, Video · Max 100MB free
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {FORMAT_BADGES.map(fmt => (
              <span key={fmt} className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
                {fmt}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-2">
            {files.map((file, i) => (
              <motion.div key={`${file.name}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-card flex items-center gap-3 px-4 py-3">
                <File size={18} className="text-purple-400 shrink-0" />
                <span className="flex-1 truncate text-sm">{file.name}</span>
                <span className="text-xs text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                <button onClick={() => removeFile(i)} className="text-white/40 hover:text-pink-400 transition-colors">
                  <X size={16} />
                </button>
              </motion.div>
            ))}
            <button onClick={handleConvert} className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-semibold text-white transition-opacity hover:opacity-90">
              ⚡ Convert {files.length} File{files.length > 1 ? 's' : ''} Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}