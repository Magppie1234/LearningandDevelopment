'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  Search,
  Sparkles,
  FileText,
  Table,
  PlayCircle,
  Presentation,
  ExternalLink,
  Bookmark,
  Share2,
  Eye,
  Flame,
  Clock,
  ArrowRight,
  X,
} from 'lucide-react'
import {
  documents,
  popularDocuments,
  recentlyUpdated,
  categories,
} from '@/data/knowledge'
import type { DocumentCategory, DocumentType } from '@/data/knowledge'

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number]

const typeIconConfig: Record<
  DocumentType,
  { icon: typeof FileText; color: string }
> = {
  PDF: { icon: FileText, color: 'bg-surface-rose text-ink-primary' },
  DOCX: { icon: FileText, color: 'bg-surface-blue text-ink-primary' },
  XLSX: { icon: Table, color: 'bg-surface-sage text-ink-primary' },
  MP4: { icon: PlayCircle, color: 'bg-surface-olive text-ink-primary' },
  PPT: { icon: Presentation, color: 'bg-accent-gold text-ink-primary' },
  Link: { icon: ExternalLink, color: 'bg-surface-mid text-parchment' },
}

const typeColorMap: Record<DocumentType, string> = {
  PDF: 'text-surface-rose',
  DOCX: 'text-surface-blue',
  XLSX: 'text-surface-sage',
  MP4: 'text-surface-olive',
  PPT: 'text-accent-gold',
  Link: 'text-surface-mid',
}

const categoryColors: Record<string, string> = {
  SOPs: 'bg-surface-blue/20 text-ink-primary',
  Policies: 'bg-surface-rose/20 text-ink-primary',
  'Process Documents': 'bg-surface-sage/20 text-ink-primary',
  'Product Catalogs': 'bg-accent-gold/20 text-ink-primary',
  'Installation Manuals': 'bg-surface-olive/20 text-ink-primary',
  'Quality Standards': 'bg-surface-blue/20 text-ink-primary',
  'Training Videos': 'bg-surface-olive/20 text-ink-primary',
  Templates: 'bg-surface-gold/20 text-ink-primary',
  Checklists: 'bg-surface-rose/20 text-ink-primary',
  'Technical Drawings': 'bg-surface-mid/20 text-ink-primary',
}

/* ------------------------------------------------------------------ */
/*  Document Type Icon                                                */
/* ------------------------------------------------------------------ */
function TypeIcon({ type }: { type: DocumentType }) {
  const config = typeIconConfig[type]
  const Icon = config.icon
  return (
    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center', config.color)}>
      <Icon size={18} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Document Card                                                     */
/* ------------------------------------------------------------------ */
function DocumentCard({
  doc,
  index,
}: {
  doc: (typeof documents)[number]
  index: number
}) {
  const typeColor = typeColorMap[doc.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: easeOut }}
      className="group bg-cream rounded-lg p-5 border border-[rgba(0,59,70,0.08)] shadow-card hover:shadow-elevated hover:-translate-y-[3px] transition-all duration-300 flex flex-col"
    >
      {/* Top row: icon + category */}
      <div className="flex items-start justify-between mb-3">
        <TypeIcon type={doc.type} />
        <span
          className={cn(
            'text-[11px] font-medium px-2.5 py-1 rounded-full',
            categoryColors[doc.category] ?? 'bg-surface-light/30 text-ink-primary'
          )}
        >
          {doc.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-ink-primary leading-snug line-clamp-2 mb-1.5">
        {doc.title}
      </h3>

      {/* Description */}
      <p className="text-[13px] text-ink-tertiary leading-relaxed line-clamp-2 mb-3 flex-1">
        {doc.description}
      </p>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded bg-parchment', typeColor)}>
          {doc.type}
        </span>
        <span className="text-[11px] text-ink-tertiary">{doc.fileSize}</span>
        <span className="text-[11px] text-ink-tertiary">
          {format(new Date(doc.updatedAt), 'MMM d, yyyy')}
        </span>
        <span className="text-[11px] text-ink-tertiary bg-parchment px-2 py-0.5 rounded-full">
          {doc.department}
        </span>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-3 border-t border-[rgba(0,59,70,0.06)]">
        <div className="flex items-center gap-2">
          <button className="text-xs font-medium text-ink-primary bg-parchment hover:bg-ink-primary hover:text-parchment px-3 py-1.5 rounded-full transition-all duration-200">
            Open
          </button>
          <button className="text-xs font-medium text-ink-secondary hover:text-ink-primary px-3 py-1.5 rounded-full transition-all duration-200">
            Download
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink-primary hover:bg-parchment transition-all">
            <Bookmark size={14} />
          </button>
          <button className="w-7 h-7 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink-primary hover:bg-parchment transition-all">
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */
export default function Knowledge() {
  const [activeCategory, setActiveCategory] = useState<DocumentCategory>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [askAI, setAskAI] = useState(false)

  const filteredDocs = useMemo(() => {
    let result = documents
    if (activeCategory !== 'All') {
      result = result.filter((d) => d.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.department.toLowerCase().includes(q)
      )
    }
    return result
  }, [activeCategory, searchQuery])

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* ====== Section 1: Page Header ====== */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="font-serif text-[56px] font-normal text-ink-primary leading-tight mb-3"
        >
          Knowledge Center
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
          className="text-lg text-ink-secondary max-w-[560px] mx-auto mb-8"
        >
          Your central repository for all Magppie documents, policies, and
          training materials.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: easeOut }}
          className="max-w-[680px] mx-auto"
        >
          <div className="relative flex items-center">
            <Search
              size={20}
              className="absolute left-5 text-ink-tertiary pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents, SOPs, policies, manuals..."
              className="w-full h-14 bg-cream rounded-full pl-14 pr-[140px] text-base text-ink-primary placeholder:text-ink-tertiary border border-[rgba(0,59,70,0.12)] focus:border-ink-primary focus:outline-none focus:ring-[3px] focus:ring-[rgba(0,59,70,0.08)] transition-all"
            />
            <button className="absolute right-2 bg-ink-primary text-parchment px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-ink-secondary transition-all">
              Search
            </button>
          </div>

          {/* AI toggle pill */}
          <div className="flex justify-center mt-3">
            <button
              onClick={() => setAskAI(!askAI)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200',
                askAI
                  ? 'bg-accent-gold/10 border-accent-gold text-ink-primary'
                  : 'bg-transparent border-accent-gold/40 text-ink-secondary hover:border-accent-gold'
              )}
            >
              <Sparkles size={16} className={askAI ? 'text-accent-gold' : ''} />
              Ask AI
            </button>
          </div>
        </motion.div>
      </motion.section>

      {/* ====== Section 2: AI Assistant CTA ====== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: easeOut }}
        className="rounded-3xl bg-gradient-to-r from-stone-espresso to-stone-charcoal p-8 mb-10"
      >
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Left */}
          <div className="flex-1">
            <div className="w-12 h-12 rounded-full bg-accent-gold flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-ink-primary" />
            </div>
            <h2 className="font-serif text-[28px] font-normal text-stone-ivory mb-2">
              Can&apos;t Find What You Need?
            </h2>
            <p className="text-base text-stone-ivory/80 leading-relaxed max-w-[560px]">
              Ask our AI Knowledge Assistant. It can search across all documents,
              answer questions about policies and procedures, and guide you to
              the right resources.
            </p>
          </div>

          {/* Right */}
          <div className="flex-1 flex flex-col items-end gap-4">
            <div className="flex flex-wrap gap-2 justify-end">
              {[
                'What is the returns policy?',
                'How do I submit an expense report?',
                'Safety protocol for installations',
              ].map((q) => (
                <span
                  key={q}
                  className="text-xs text-stone-ivory/90 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full"
                >
                  {q}
                </span>
              ))}
            </div>
            <Link
              href="/ai-assistant"
              className="bg-accent-gold text-ink-primary px-6 py-2.5 rounded-full text-sm font-semibold hover:brightness-95 transition-all inline-flex items-center gap-2"
            >
              Ask AI Assistant
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ====== Section 3: Category Pills ====== */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
          {categories.map((cat, i) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: i * 0.04, ease: easeOut }}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-5 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0',
                activeCategory === cat
                  ? 'bg-ink-primary text-parchment'
                  : 'bg-cream text-ink-secondary hover:text-ink-primary hover:bg-cream/80'
              )}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* ====== Section 4: Document Grid ====== */}
      <section className="mb-10">
        {/* Filter indicator */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] text-ink-tertiary">
            Showing {filteredDocs.length} document
            {filteredDocs.length !== 1 ? 's' : ''}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          </p>
          {activeCategory !== 'All' && (
            <button
              onClick={() => setActiveCategory('All')}
              className="flex items-center gap-1 text-[13px] text-ink-secondary hover:text-ink-primary transition-colors"
            >
              <X size={14} />
              Clear filter
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDocs.map((doc, i) => (
              <DocumentCard key={doc.id} doc={doc} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredDocs.length === 0 && (
          <div className="text-center py-16">
            <Search size={48} className="text-ink-tertiary mx-auto mb-4" />
            <h3 className="font-serif text-xl text-ink-primary mb-2">
              No documents found
            </h3>
            <p className="text-sm text-ink-tertiary">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </section>

      {/* ====== Section 5: Popular Resources ====== */}
      <motion.section
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-5">
          <Flame size={20} className="text-accent-gold" />
          <h2 className="text-lg font-semibold text-ink-primary">
            Most Accessed This Month
          </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {popularDocuments.map((doc, i) => (
            <motion.div
              key={doc.rank}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: easeOut }}
              className="min-w-[220px] max-w-[220px] bg-cream rounded-lg p-4 border border-[rgba(0,59,70,0.08)] shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 relative"
            >
              <span className="absolute top-3 right-3 text-[28px] font-bold text-accent-gold/40 leading-none">
                {doc.rank}
              </span>
              <h4 className="text-[13px] font-semibold text-ink-primary line-clamp-2 mb-2 pr-6">
                {doc.title}
              </h4>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-tertiary mb-2">
                <Eye size={12} />
                {doc.views.toLocaleString()} views
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium px-2 py-0.5 rounded-full',
                  categoryColors[doc.category] ?? 'bg-surface-light/30 text-ink-primary'
                )}
              >
                {doc.category}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ====== Section 6: Recently Updated ====== */}
      <motion.section
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-5">
          <Clock size={20} className="text-surface-blue" />
          <h2 className="text-lg font-semibold text-ink-primary">
            Recently Updated
          </h2>
        </div>

        <div className="bg-cream rounded-lg border border-[rgba(0,59,70,0.08)] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_140px_120px_140px] gap-4 px-5 py-3 bg-parchment/60 border-b border-[rgba(0,59,70,0.08)]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">
              Document
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">
              Category
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">
              Updated
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">
              By
            </span>
          </div>

          {/* Table rows */}
          {recentlyUpdated.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06, ease: easeOut }}
              className="grid grid-cols-[1fr_140px_120px_140px] gap-4 px-5 py-3.5 border-b border-[rgba(0,59,70,0.06)] hover:bg-[rgba(0,59,70,0.03)] transition-colors items-center"
            >
              <div className="flex items-center gap-3 min-w-0">
                <TypeIcon type={doc.type} />
                <span className="text-sm font-medium text-ink-primary truncate">
                  {doc.title}
                </span>
              </div>
              <span
                className={cn(
                  'text-[11px] font-medium px-2.5 py-1 rounded-full w-fit',
                  categoryColors[doc.category] ?? 'bg-surface-light/30 text-ink-primary'
                )}
              >
                {doc.category}
              </span>
              <span className="text-[12px] text-ink-tertiary">
                {format(new Date(doc.updatedAt), 'MMM d, yyyy')}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-surface-blue flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-ink-primary">
                    {doc.authorInitials}
                  </span>
                </div>
                <span className="text-[12px] text-ink-secondary truncate">
                  {doc.author}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
