'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Mail } from 'lucide-react'

/**
 * L&D Portal login — a demo, email-based welcome gate styled after
 * magppiekitchen.com: rotating Wellness Kitchen photography (real brand
 * assets pulled from the site), the white Magppie logo, serif headline
 * carrying the portal's aim, and a single-field "Let's get started" card.
 * No real auth yet — the portal runs on its demo identity; the email is
 * kept locally so a future account system can pick it up.
 */

const KITCHENS = [
  '/login/kitchen-00.jpg',
  '/login/kitchen-01.jpg',
  '/login/kitchen-02.jpg',
  '/login/kitchen-33.jpg',
  '/login/kitchen-black-kitchen.jpg',
]

const ROTATE_MS = 3500

export default function LoginPage() {
  const router = useRouter()
  const [slide, setSlide] = useState(0)
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [entering, setEntering] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % KITCHENS.length), ROTATE_MS)
    return () => clearInterval(t)
  }, [])

  const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email])

  const enter = (asGuest = false) => {
    if (!asGuest && !emailOk) {
      setTouched(true)
      return
    }
    setEntering(true)
    try {
      if (!asGuest) window.localStorage.setItem('ld-login-email', email.trim())
      window.localStorage.setItem('ld-logged-in-at', new Date().toISOString())
    } catch {}
    setTimeout(() => router.push('/'), 650)
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0b0d0c] text-[#f3ede2]">
      {/* rotating Wellness Kitchen photography */}
      <AnimatePresence>
        <motion.img
          key={slide}
          src={KITCHENS[slide]}
          alt=""
          aria-hidden
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.9 }, scale: { duration: 2.4, ease: 'linear' } }}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </AnimatePresence>
      {/* legibility veil */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(100deg, rgba(8,10,9,0.82) 0%, rgba(8,10,9,0.55) 45%, rgba(8,10,9,0.35) 100%)',
        }}
      />

      {/* announcement strip, as on magppiekitchen.com */}
      <div className="absolute top-0 inset-x-0 border-b border-white/10 bg-black/30 backdrop-blur-[2px]">
        <p className="px-6 py-2.5 text-center text-[10.5px] sm:text-[11px] tracking-[0.28em] text-[#f3ede2]/80">
          MAGPPIE L&D · KBIS 2026 “MOST UNEXPECTED INNOVATION” · ALONGSIDE CAESARSTONE &amp; LG
        </p>
      </div>

      {/* logo */}
      <div className="absolute top-12 left-6 sm:left-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/login/magppie-white.svg" alt="Magppie" className="h-7 sm:h-8 w-auto" draggable={false} />
        <p className="mt-1.5 text-[10px] tracking-[0.34em] text-[#f3ede2]/60">
          LEARNING &amp; DEVELOPMENT
        </p>
      </div>

      {/* content */}
      <div className="absolute inset-0 flex items-center px-6 sm:px-12 pt-16">
        <div className="w-full max-w-[1200px] mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          {/* the portal's aim */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block"
          >
            <p className="text-[11px] tracking-[0.35em] text-[#c9a06b] mb-6">
              INTRODUCING THE MAGPPIE L&amp;D PORTAL
            </p>
            <h1 className="font-serif text-5xl xl:text-6xl leading-[1.12]">
              Master your craft.
              <br />
              For a lifetime of
              <br />
              wellness.
            </h1>
            <p className="mt-7 max-w-[520px] text-[15px] leading-relaxed text-[#f3ede2]/75">
              Guided learning paths, thirteen department academies, certifications and a
              self-service knowledge center — everything behind the world&apos;s first kitchens
              built entirely in stone, taught the way Magppie builds: to last.
            </p>
          </motion.div>

          {/* let's get started card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[440px] lg:ml-auto rounded-2xl bg-[#faf6ef] text-[#1c1a17] shadow-[0_40px_90px_rgba(0,0,0,0.55)] px-8 sm:px-10 py-10"
          >
            <h2 className="font-serif text-4xl leading-tight">Let&apos;s get started.</h2>
            <p className="mt-2 text-[13px] text-[#1c1a17]/60">
              Sign in with your email to enter the portal.
            </p>

            <label className="block mt-8 text-[11px] font-semibold tracking-[0.22em] text-[#1c1a17]/55">
              EMAIL *
            </label>
            <div className="mt-2 flex items-center gap-2.5 border-b border-[#1c1a17]/25 focus-within:border-[#1c1a17] transition-colors pb-2.5">
              <Mail size={16} className="shrink-0 text-[#1c1a17]/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && enter()}
                placeholder="you@mymagppie.com"
                autoFocus
                className="w-full bg-transparent text-[15px] outline-none placeholder:text-[#1c1a17]/35"
                aria-label="Email address"
              />
            </div>
            {touched && !emailOk && (
              <p className="mt-2 text-[12px] text-[#a4462d]">
                Please enter a valid email address.
              </p>
            )}

            <button
              type="button"
              onClick={() => enter()}
              disabled={entering}
              className="group mt-8 w-full flex items-center justify-center gap-2.5 bg-[#141414] text-[#f3ede2] rounded-none px-6 py-4 text-[12.5px] font-semibold tracking-[0.24em] transition-all hover:bg-[#2a2622] disabled:opacity-70"
            >
              {entering ? 'WELCOME…' : "LET'S GET STARTED"}
              {!entering && (
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              )}
            </button>

            <button
              type="button"
              onClick={() => enter(true)}
              disabled={entering}
              className="mt-4 w-full text-center text-[12.5px] text-[#1c1a17]/55 underline underline-offset-4 hover:text-[#1c1a17] transition-colors"
            >
              Continue as guest
            </button>

            <p className="mt-7 text-[11.5px] leading-relaxed text-[#1c1a17]/45">
              Demo sign-in — any email works for now. Your email stays on this device; personal
              accounts and progress sync arrive with the account system.
            </p>
          </motion.div>
        </div>
      </div>

      {/* slide dots */}
      <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2">
        {KITCHENS.map((k, i) => (
          <span
            key={k}
            className="h-1 rounded-full transition-all duration-500"
            style={{
              width: i === slide ? 24 : 8,
              backgroundColor: i === slide ? '#c9a06b' : 'rgba(243,237,226,0.35)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
