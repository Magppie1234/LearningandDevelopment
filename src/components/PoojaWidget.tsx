'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Sticky AI widget (§3.4): Pooja available on every portal page so employees
 * can ask mid-course instead of navigating away. Same API as /ai-assistant
 * (training-doc RAG + skill-gap recommendations).
 */

interface Msg {
  role: 'user' | 'ai'
  text: string
}

export default function PoojaWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'ai',
      text: 'Hi, I’m Pooja. Ask me anything from the sales training document, or ask "what should I learn next?" for a recommendation based on your skill gaps.',
    },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages, busy])

  // The full assistant page already exists — don't double up there.
  if (pathname === '/ai-assistant') return null

  async function send() {
    const q = input.trim()
    if (!q || busy) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: q }])
    setBusy(true)
    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      const data = await res.json()
      setMessages((m) => [...m, { role: 'ai', text: data.answer ?? 'Something went wrong.' }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'ai', text: 'I couldn’t reach the assistant just now — please try again.' },
      ])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-24 right-5 z-[60] w-[min(380px,calc(100vw-2.5rem))] rounded-2xl bg-cream border border-[rgba(0,59,70,0.1)] shadow-elevated overflow-hidden flex flex-col"
          >
            <header className="flex items-center justify-between px-4 py-3 bg-ink-primary">
              <p className="text-sm font-semibold text-parchment flex items-center gap-2">
                <Sparkles size={14} className="text-accent-gold" /> Ask Pooja
              </p>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="text-parchment/70 hover:text-parchment transition-colors"
              >
                <X size={16} />
              </button>
            </header>

            <div ref={scrollRef} className="h-72 overflow-y-auto p-3 space-y-2.5">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    'max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed whitespace-pre-line',
                    m.role === 'ai'
                      ? 'bg-parchment text-ink-primary'
                      : 'bg-ink-primary text-parchment ml-auto',
                  )}
                >
                  {m.text}
                </div>
              ))}
              {busy && (
                <div className="flex items-center gap-2 text-[12px] text-ink-tertiary px-1">
                  <Loader2 size={13} className="animate-spin" /> Pooja is thinking…
                </div>
              )}
            </div>

            <div className="p-2.5 border-t border-[rgba(0,59,70,0.08)] flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask mid-course…"
                className="flex-1 bg-parchment border border-[rgba(0,59,70,0.12)] rounded-full px-3.5 py-2 text-[13px] focus:outline-none focus:border-ink-primary"
              />
              <button
                type="button"
                onClick={send}
                disabled={!input.trim() || busy}
                className="shrink-0 w-9 h-9 rounded-full bg-ink-primary text-parchment flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        aria-label="Ask Pooja"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-5 z-[60] w-13 h-13 p-3.5 rounded-full bg-ink-primary text-accent-gold shadow-elevated hover:scale-105 transition-transform"
      >
        <Sparkles size={22} />
      </button>
    </>
  )
}
