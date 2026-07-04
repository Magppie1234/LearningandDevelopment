'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  Search,
  BookOpen,
  MessageCircle,
  Send,
  Paperclip,
  Mic,
  FileText,
  ShieldCheck,
  TrendingUp,
  Package,
  Award,
  GraduationCap,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Copy,
  CheckCircle2,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ChatMessage {
  id: string
  role: 'ai' | 'user'
  content: string
  sources?: string[]
  timestamp: Date
}

/* ------------------------------------------------------------------ */
/*  Real retrieval \u2014 answers from the Magppie AI Bot Training Document */
/*  via /api/assistant/chat. See src/lib/training-search.ts for how    */
/*  matches are scored today (keyword/phrase retrieval; upgrades to    */
/*  vector search once an embedding provider + live Supabase project   */
/*  are configured, without this call site changing).                  */
/* ------------------------------------------------------------------ */
interface AssistantApiResponse {
  found: boolean
  answer: string
  sources: { id: string; label: string }[]
  documentVersion: string
  documentSource: string
}

async function fetchAIResponse(
  query: string,
): Promise<{ content: string; sources?: string[] }> {
  try {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: query }),
    })
    if (!res.ok) throw new Error(`Assistant API returned ${res.status}`)
    const data = (await res.json()) as AssistantApiResponse
    return {
      content: data.answer,
      sources: data.found ? data.sources.map((s) => s.label) : undefined,
    }
  } catch {
    return {
      content:
        "Sorry, I couldn't reach the training document search just now. Please try again in a moment.",
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Typing Indicator                                                   */
/* ------------------------------------------------------------------ */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ink-primary to-ink-secondary flex items-center justify-center flex-shrink-0">
        <Sparkles size={14} className="text-accent-gold" />
      </div>
      <div className="bg-parchment rounded-2xl rounded-tl-md px-5 py-4 border border-[rgba(0,59,70,0.06)]">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-ink-tertiary animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-ink-tertiary animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-ink-tertiary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-[12px] text-ink-tertiary">AI is thinking...</span>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Message Bubble                                                     */
/* ------------------------------------------------------------------ */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isAI = message.role === 'ai'
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [message.content])

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      className={cn('flex gap-3', isAI ? 'flex-row' : 'flex-row-reverse')}
    >
      {/* Avatar (AI only) */}
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ink-primary to-ink-secondary flex items-center justify-center flex-shrink-0 self-start">
          <Sparkles size={14} className="text-accent-gold" />
        </div>
      )}

      {/* Bubble */}
      <div className={cn('max-w-[75%]', isAI ? '' : 'items-end')}>        <div
          className={cn(
            'px-5 py-4 text-sm leading-relaxed whitespace-pre-line',
            isAI
              ? 'bg-parchment rounded-2xl rounded-tl-md text-ink-primary border border-[rgba(0,59,70,0.06)]'
              : 'bg-ink-primary rounded-2xl rounded-tr-md text-parchment'
          )}
        >
          {message.content}
        </div>

        {/* Sources (AI only) */}
        {isAI && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.sources.map((s) => (
              <span
                key={s}
                className="text-[10px] font-semibold px-2 py-1 rounded-full bg-surface-blue/30 text-ink-primary cursor-pointer hover:bg-surface-blue/50 transition-colors"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Actions + Timestamp */}
        <div className={cn('flex items-center gap-3 mt-1.5', isAI ? '' : 'justify-end')}>          {isAI && (
            <>
              <button className="flex items-center gap-1 text-[11px] text-ink-tertiary hover:text-ink-primary transition-colors">
                <ThumbsUp size={12} />
                Helpful
              </button>
              <button className="flex items-center gap-1 text-[11px] text-ink-tertiary hover:text-ink-primary transition-colors">
                <ThumbsDown size={12} />
                Not Helpful
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-ink-tertiary hover:text-ink-primary transition-colors"
              >
                {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </>
          )}
          <span
            className={cn(
              'text-[10px]',
              isAI ? 'text-ink-tertiary' : 'text-parchment/60'
            )}
          >
            {format(message.timestamp, 'h:mm a')}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Suggested Query Card                                               */
/* ------------------------------------------------------------------ */
const queryIconConfig = [
  { icon: ShieldCheck, color: 'bg-surface-sage/20 text-ink-primary', category: 'Warranty' },
  { icon: FileText, color: 'bg-surface-blue/20 text-ink-primary', category: 'Objection Handling' },
  { icon: TrendingUp, color: 'bg-accent-gold/20 text-ink-primary', category: 'Pricing' },
  { icon: Package, color: 'bg-surface-mid/20 text-ink-primary', category: 'Product' },
  { icon: BookOpen, color: 'bg-surface-olive/20 text-ink-primary', category: 'Bot Persona' },
  { icon: Award, color: 'bg-surface-blue/20 text-ink-primary', category: 'Locations' },
]

const suggestedQueries = [
  "What's included in the 25-year guarantee?",
  'How do I handle the objection that we are too expensive?',
  'Do you offer EMI or payment plans?',
  "What's the difference between SilverStone and granite?",
  'What are the forbidden words the bot should never use?',
  'Where are the Magppie stores located?',
]

function SuggestedQueryCard({
  query,
  index,
  onClick,
}: {
  query: string
  index: number
  onClick: () => void
}) {
  const config = queryIconConfig[index]
  const Icon = config.icon

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      onClick={onClick}
      className="bg-cream rounded-xl p-4 border border-[rgba(0,59,70,0.08)] text-left hover:shadow-card hover:border-l-[3px] hover:border-l-ink-primary/30 transition-all duration-200 group"
    >
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center mb-3',
          config.color
        )}
      >
        <Icon size={20} />
      </div>
      <p className="text-sm font-medium text-ink-primary leading-snug mb-2 group-hover:text-ink-secondary transition-colors">
        {query}
      </p>
      <span className="text-[10px] font-medium text-ink-tertiary uppercase tracking-wide">
        {config.category}
      </span>
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/*  AI Feature Card                                                    */
/* ------------------------------------------------------------------ */
const featureData = [
  {
    icon: Search,
    title: 'Product & FAQ',
    description: 'Answers pulled from the 62-question Master FAQ — never invented',
    examples: ['Is SilverStone food-grade?', 'Does it fade over time?'],
    color: 'bg-surface-blue/15 text-surface-blue',
  },
  {
    icon: GraduationCap,
    title: 'Sales Scripts',
    description: 'Reproduces the 8-stage pitch flow and objection scripts closely',
    examples: ['Opening line script', "Customer says they've never heard of us"],
    color: 'bg-surface-olive/15 text-surface-olive',
  },
  {
    icon: TrendingUp,
    title: 'Pricing & Guarantees',
    description: 'Exact figures from the pricing matrix — no rounding, no approximating',
    examples: ['Wardrobe price per sq.ft.', 'What does the hardware warranty cover?'],
    color: 'bg-accent-gold/15 text-accent-gold',
  },
  {
    icon: Award,
    title: 'Bot Persona Rules',
    description: 'Pacing, tone, and forbidden-word rules for the Pooja bot persona',
    examples: ['Pacing rules for pricing', 'Words the bot must never use'],
    color: 'bg-surface-sage/15 text-surface-sage',
  },
]

function AIFeatureCard({
  feature,
  index,
}: {
  feature: (typeof featureData)[number]
  index: number
}) {
  const Icon = feature.icon
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      className="bg-cream rounded-xl p-6 border border-[rgba(0,59,70,0.08)] text-center hover:shadow-card transition-all duration-300"
    >
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4',
          feature.color
        )}
      >
        <Icon size={24} />
      </div>
      <h3 className="text-base font-semibold text-ink-primary mb-2">
        {feature.title}
      </h3>
      <p className="text-[13px] text-ink-tertiary leading-relaxed mb-4">
        {feature.description}
      </p>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {feature.examples.map((ex) => (
          <span
            key={ex}
            className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-parchment text-ink-tertiary"
          >
            {ex}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      content:
        "Hello! I'm your Magppie AI Learning Assistant. Ask me anything covered in the AI Bot Master Training Document — SilverStone product facts, pricing and guarantees, objection-handling scripts, or the sales pitch flow — and I'll answer directly from that document, not general knowledge. What would you like help with today?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
      setInputValue('')
      setIsTyping(true)

      fetchAIResponse(text.trim()).then(({ content, sources }) => {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'ai',
          content,
          sources,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMsg])
        setIsTyping(false)
      })
    },
    []
  )

  const handleSend = useCallback(() => {
    sendMessage(inputValue)
  }, [inputValue, sendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleSuggestedQuery = useCallback(
    (query: string) => {
      sendMessage(query)
      inputRef.current?.focus()
    },
    [sendMessage]
  )

  return (
    <div className="max-w-[900px] mx-auto">
      {/* ====== Section 1: AI Hero ====== */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
        className="rounded-3xl bg-gradient-to-r from-ink-primary to-ink-secondary p-6 mb-8"
      >
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-full bg-accent-gold/20 border-2 border-accent-gold flex items-center justify-center">
              <Sparkles size={28} className="text-accent-gold" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-surface-sage rounded-full border-2 border-ink-primary animate-pulse" />
          </motion.div>

          {/* Title area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex-1 text-center sm:text-left"
          >
            <h1 className="font-serif text-4xl font-normal text-parchment mb-1">
              Magppie AI Assistant
            </h1>
            <p className="text-lg text-parchment/80">
              Your personal learning coach and knowledge guide
            </p>
          </motion.div>

          {/* Capability pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col gap-2 flex-shrink-0"
          >
            {[
              { icon: Search, label: 'Search Documents' },
              { icon: BookOpen, label: 'Learning Coach' },
              { icon: MessageCircle, label: 'Ask Anything' },
            ].map((pill, i) => {
              const Icon = pill.icon
              return (
                <motion.span
                  key={pill.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: 0.35 + i * 0.1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-parchment/20 backdrop-blur-sm text-parchment text-xs font-medium"
                >
                  <Icon size={14} />
                  {pill.label}
                </motion.span>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* ====== Section 2: Chat Interface ====== */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
        className="bg-cream rounded-3xl border border-[rgba(0,59,70,0.08)] flex flex-col min-h-[520px] shadow-card mb-8"
      >
        {/* Message History */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-5 max-h-[480px] hide-scrollbar"
        >
          <AnimatePresence>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>

          {isTyping && <TypingIndicator />}
        </div>

        {/* Input Area */}
        <div className="border-t border-[rgba(0,59,70,0.08)] p-4">
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-parchment flex items-center justify-center text-ink-tertiary hover:text-ink-primary transition-colors flex-shrink-0">
              <Paperclip size={18} />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about courses, policies, products..."
              className="flex-1 h-12 bg-parchment rounded-full px-5 text-sm text-ink-primary placeholder:text-ink-tertiary border border-[rgba(0,59,70,0.08)] focus:border-ink-primary focus:outline-none focus:ring-[3px] focus:ring-[rgba(0,59,70,0.08)] transition-all"
            />

            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0',
                inputValue.trim()
                  ? 'bg-ink-primary text-parchment hover:bg-ink-secondary scale-100'
                  : 'bg-cream text-ink-tertiary scale-90'
              )}
            >
              <Send size={18} />
            </button>

            <button className="w-10 h-10 rounded-full bg-parchment flex items-center justify-center text-ink-tertiary hover:text-surface-rose transition-colors flex-shrink-0">
              <Mic size={18} />
            </button>
          </div>
        </div>
      </motion.section>

      {/* ====== Section 3: Suggested Queries ====== */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-ink-primary mb-4">Try Asking</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {suggestedQueries.map((query, i) => (
            <SuggestedQueryCard
              key={query}
              query={query}
              index={i}
              onClick={() => handleSuggestedQuery(query)}
            />
          ))}
        </div>
      </section>

      {/* ====== Section 4: AI Features Overview ====== */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="font-serif text-2xl font-normal text-ink-primary mb-6 text-center">
          What I Can Help With
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureData.map((feature, i) => (
            <AIFeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </motion.section>
    </div>
  )
}
