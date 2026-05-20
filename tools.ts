export const TOOLS: Record<string, ToolConfig> = {
  'pdf-to-word': {
    title: 'PDF to Word', category: 'PDF Tool', icon: '📄',
    description: 'Convert PDF to fully editable Word documents. Preserves formatting, fonts, tables, and images.',
    inputFormat: 'PDF', outputFormat: 'DOCX',
    accept: { 'application/pdf': ['.pdf'] },
    options: [
      { key: 'format', label: 'Output Format', type: 'select', values: ['DOCX', 'DOC', 'RTF'], default: 'DOCX' },
      { key: 'preserveLayout', label: 'Preserve Layout', type: 'toggle', default: true },
      { key: 'extractImages', label: 'Extract Images', type: 'toggle', default: true },
    ]
  },
  'word-to-pdf': {
    title: 'Word to PDF', category: 'PDF Tool', icon: '📝',
    description: 'Convert Word documents to PDF with perfect formatting. Supports DOCX and DOC files.',
    inputFormat: 'DOCX', outputFormat: 'PDF',
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'] },
    options: [
      { key: 'quality', label: 'PDF Quality', type: 'select', values: ['High', 'Medium', 'Low'], default: 'High' },
      { key: 'compress', label: 'Compress Output', type: 'toggle', default: false },
    ]
  },
  'merge-pdf': {
    title: 'Merge PDF', category: 'PDF Tool', icon: '🔗',
    description: 'Combine multiple PDF files into one. Drag to reorder before merging.',
    inputFormat: 'PDF', outputFormat: 'PDF',
    accept: { 'application/pdf': ['.pdf'] },
    options: [
      { key: 'filename', label: 'Output File Name', type: 'text', default: 'merged_output' },
      { key: 'pageNumbers', label: 'Add Page Numbers', type: 'toggle', default: false },
      { key: 'bookmarks', label: 'Add Bookmarks', type: 'toggle', default: true },
    ]
  },
  'compress-pdf': {
    title: 'Compress PDF', category: 'PDF Tool', icon: '🗜️',
    description: 'Reduce PDF size without noticeable quality loss using AI-powered smart compression.',
    inputFormat: 'PDF', outputFormat: 'PDF',
    accept: { 'application/pdf': ['.pdf'] },
    options: [
      { key: 'level', label: 'Compression Level', type: 'select', values: ['High (Smallest)', 'Medium (Balanced)', 'Low (Best Quality)'], default: 'Medium (Balanced)' },
      { key: 'aiCompress', label: 'AI Smart Compress', type: 'toggle', default: true },
    ]
  },
  'ocr-pdf': {
    title: 'OCR PDF', category: 'AI Tool', icon: '🤖',
    description: 'Extract searchable text from scanned PDF documents using AI OCR with 99.5% accuracy.',
    inputFormat: 'PDF', outputFormat: 'PDF/TXT',
    accept: { 'application/pdf': ['.pdf'] },
    options: [
      { key: 'language', label: 'Document Language', type: 'select', values: ['English', 'Arabic', 'Urdu', 'Spanish', 'French', 'German'], default: 'English' },
      { key: 'output', label: 'Output Format', type: 'select', values: ['Searchable PDF', 'Plain Text', 'Word DOCX'], default: 'Searchable PDF' },
      { key: 'autoCorrect', label: 'AI Auto-Correct', type: 'toggle', default: true },
    ]
  },
  'image-compressor': {
    title: 'Image Compressor', category: 'Image Tool', icon: '⚡',
    description: 'Compress JPG, PNG, WebP images with AI optimization. Reduce size by up to 90%.',
    inputFormat: 'JPG/PNG/WebP', outputFormat: 'Optimized Image',
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    options: [
      { key: 'quality', label: 'Target Quality', type: 'select', values: ['Auto (AI)', '90%', '80%', '60%', '40%'], default: 'Auto (AI)' },
      { key: 'format', label: 'Output Format', type: 'select', values: ['Keep Original', 'Convert to WebP', 'Convert to AVIF'], default: 'Keep Original' },
    ]
  },
  'audio-converter': {
    title: 'Audio Converter', category: 'Media Tool', icon: '🎵',
    description: 'Convert between MP3, WAV, FLAC, AAC, OGG and 30+ audio formats at any bitrate.',
    inputFormat: 'Audio', outputFormat: 'Audio',
    accept: { 'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'] },
    options: [
      { key: 'format', label: 'Output Format', type: 'select', values: ['MP3', 'WAV', 'FLAC', 'AAC', 'OGG', 'M4A'], default: 'MP3' },
      { key: 'bitrate', label: 'Audio Bitrate', type: 'select', values: ['320 kbps', '256 kbps', '192 kbps', '128 kbps', '64 kbps'], default: '256 kbps' },
      { key: 'trim', label: 'Trim Audio', type: 'toggle', default: false },
    ]
  },
  'video-converter': {
    title: 'Video Converter', category: 'Media Tool', icon: '🎬',
    description: 'Convert video files between MP4, AVI, MOV, MKV, WebM and 50+ formats. GPU accelerated.',
    inputFormat: 'Video', outputFormat: 'Video',
    accept: { 'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm'] },
    options: [
      { key: 'format', label: 'Output Format', type: 'select', values: ['MP4', 'AVI', 'MOV', 'MKV', 'WebM', 'GIF'], default: 'MP4' },
      { key: 'resolution', label: 'Resolution', type: 'select', values: ['Original', '4K (2160p)', '1080p', '720p', '480p', '360p'], default: 'Original' },
      { key: 'compress', label: 'Smart Compress', type: 'toggle', default: false },
    ]
  },
}

export interface ToolConfig {
  title: string; category: string; icon: string; description: string;
  inputFormat: string; outputFormat: string; accept: Record<string, string[]>;
  options?: ToolOption[]
}
export interface ToolOption {
  key: string; label: string; type: 'select' | 'toggle' | 'text' | 'number';
  values?: string[]; default?: string | boolean | number
}