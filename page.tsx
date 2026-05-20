'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, Cloud, Bot, Smartphone, Plug } from 'lucide-react'
import Navbar from '@/components/Navbar'
import HeroDropZone from '@/components/HeroDropZone'
import ToolGrid from '@/components/ToolGrid'
import PricingSection from '@/components/PricingSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import FAQSection from '@/components/FAQSection'
import Footer from '@/components/Footer'
import StatsRow from '@/components/StatsRow'

const features = [
  { icon: Zap, title: 'Lightning Fast', desc: 'AI-powered engine converts files in seconds. Batch processing included for all plans.' },
  { icon: Shield, title: 'Military-Grade Security', desc: '256-bit AES encryption. Files auto-deleted after 1 hour. Fully GDPR compliant.' },
  { icon: Cloud, title: 'Cloud Ready', desc: 'Connect Google Drive, Dropbox & OneDrive. Access your files from anywhere.' },
  { icon: Bot, title: 'AI-Powered OCR', desc: 'Extract text from scanned documents with 99.5% accuracy using our neural engine.' },
  { icon: Smartphone, title: 'Mobile First PWA', desc: 'Works perfectly on any device. Install as an app. Offline support included.' },
  { icon: Plug, title: 'REST API', desc: 'Integrate FileFlux into your workflow. Full docs, SDKs for 5 languages.' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function HomePage() {
  return (
    <main>
      <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 text-center">
        {/* Animated Background Orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="orb absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-[#7c6fff] opacity-15 blur-[100px]" />
          <div className="orb absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full bg-[#ff6b9d] opacity-12 blur-[90px]" style={{ animationDelay: '2s' }} />
          <div className="orb absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3ecfab] opacity-8 blur-[80px]" style={{ animationDelay: '4s' }} />
        </div>

        <div className="container relative mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="mb-4 inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-semibold text-purple-400">
              ✦ Free Forever · No Sign-Up Required
            </span>
            <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl" style={{ fontFamily: 'var(--font-heading)' }}>
              Convert Your Files{' '}
              <span className="gradient-text">Instantly & Securely</span>
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-lg text-white/60">
              The most powerful online file converter. Support for 200+ formats, lightning-fast processing, and military-grade encryption.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/tools">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 font-semibold text-white shadow-lg shadow-purple-900/30">
                  Start Converting Free <ArrowRight size={18} />
                </motion.button>
              </Link>
              <button className="glass-card flex items-center gap-2 px-8 py-4 font-semibold">
                Watch Demo ▶
              </button>
            </div>
          </motion.div>

          <HeroDropZone />
        </div>
      </section>

      <StatsRow />

      {/* Popular Tools */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-purple-400">Popular Tools</p>
          <h2 className="mb-2 text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Everything in one place</h2>
          <p className="mb-10 text-white/50">20+ professional conversion tools, all free</p>
          <ToolGrid limit={8} />
          <div className="mt-8 text-center">
            <Link href="/tools">
              <button className="glass-card px-8 py-3 font-semibold hover:border-purple-500/50">View All 20+ Tools →</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-purple-400">Why FileFlux</p>
          <h2 className="mb-10 text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Built for speed, security & simplicity</h2>
          <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {features.map((f) => (
              <motion.div key={f.title} variants={itemVariants} className="glass-card p-6">
                <f.icon className="mb-4 text-purple-400" size={28} />
                <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </main>
  )
}