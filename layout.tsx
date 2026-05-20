import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import { Toaster } from 'react-hot-toast'

const syne = Syne({ subsets: ['latin'], variable: '--font-heading', weight: ['400','500','600','700','800'] })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body', weight: ['300','400','500'] })

export const metadata: Metadata = {
  title: 'FileFlux — Convert Anything, Instantly',
  description: 'Professional file converter supporting 200+ formats. PDF, Word, Images, Audio, Video — all free.',
  keywords: 'file converter, pdf to word, compress pdf, image converter, online converter',
  openGraph: {
    title: 'FileFlux — Convert Anything, Instantly',
    description: 'The most powerful online file converter. Free, fast, and secure.',
    url: 'https://fileflux.io',
    siteName: 'FileFlux',
    images: [{ url: '/og-image.png' }],
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${dmSans.variable} font-body antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            {children}
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}