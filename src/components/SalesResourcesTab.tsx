'use client'

import Link from 'next/link'
import { FileText, Download, PlayCircle, Clock, FolderOpen, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SALES_RESOURCES, type SalesResource } from '@/data/sales-resources'

/**
 * Sales academy Resources tab — real files instead of the seed placeholder
 * cards (mirrors BdResourcesTab). Groups: generated reading packs (one PDF per
 * module, verbatim from vetted content), team-provided documents, the module
 * video series (all 10 rendered videos linked to their module pages), and the
 * FAQ bank.
 */

const CARD = 'rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream'

function PackCard({ r }: { r: SalesResource }) {
  return (
    <a
      href={r.file}
      download
      className={cn(CARD, 'group flex items-start gap-3.5 p-4 hover:shadow-card transition-shadow')}
    >
      <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-accent-copper/12 border border-accent-copper/40">
        <FileText size={18} className="text-accent-copper" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-semibold text-ink-primary leading-snug">
          {r.title}
        </span>
        <span className="block text-[12px] text-ink-tertiary mt-1 leading-relaxed">
          {r.description}
        </span>
        <span className="mt-2 inline-flex items-center gap-3 text-[11px] text-ink-tertiary">
          {r.pages && <span>{r.pages} pages</span>}
          {r.sizeKb && <span>{r.sizeKb} KB</span>}
          <span className="inline-flex items-center gap-1 font-medium text-accent-copper group-hover:underline">
            <Download size={11} /> Download PDF
          </span>
        </span>
      </span>
    </a>
  )
}

function VideoCard({ r }: { r: SalesResource }) {
  const inner = (
    <>
      <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-accent-copper/12 border border-accent-copper/40">
        <PlayCircle size={18} className="text-accent-copper" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-semibold text-ink-primary leading-snug">{r.title}</span>
        <span className="block text-[12px] text-ink-tertiary mt-1 leading-relaxed">{r.description}</span>
        {r.status ? (
          <span
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium rounded-full px-2.5 py-1"
            style={{ backgroundColor: 'var(--status-risk-bg)', color: 'var(--status-risk-fg)' }}
          >
            <Clock size={11} /> {r.status}
          </span>
        ) : (
          <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-accent-copper group-hover:underline">
            <PlayCircle size={11} /> Watch on the module page
          </span>
        )}
      </span>
    </>
  )
  if (r.href) {
    return (
      <Link href={r.href} className={cn(CARD, 'group flex items-start gap-3.5 p-4 hover:shadow-card transition-shadow')}>
        {inner}
      </Link>
    )
  }
  return <div className={cn(CARD, 'flex items-start gap-3.5 p-4')}>{inner}</div>
}

export default function SalesResourcesTab() {
  const reading = SALES_RESOURCES.filter((r) => r.group === 'reading')
  const provided = SALES_RESOURCES.filter((r) => r.group === 'provided')
  const videos = SALES_RESOURCES.filter((r) => r.group === 'video')

  return (
    <div className="space-y-8">
      {/* ── Reading packs ── */}
      <section>
        <h3 className="font-serif text-2xl font-normal text-ink-primary">Reading packs</h3>
        <p className="text-[13px] text-ink-tertiary mt-1 mb-4 max-w-[640px]">
          One PDF per module — the module reading and the video narration script, assembled
          verbatim from the vetted content. Unresolved source conflicts stay flagged inside.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reading.map((r) => (
            <PackCard key={r.id} r={r} />
          ))}
        </div>
      </section>

      {/* ── Provided by the team ── */}
      <section>
        <h3 className="font-serif text-2xl font-normal text-ink-primary">From the team</h3>
        <p className="text-[13px] text-ink-tertiary mt-1 mb-4 max-w-[640px]">
          Documents supplied by Magppie — brochures, price sheets, catalogues.
        </p>
        {provided.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {provided.map((r) => (
              <PackCard key={r.id} r={r} />
            ))}
          </div>
        ) : (
          <div className={cn(CARD, 'flex items-center gap-3 p-5')}>
            <FolderOpen size={18} className="text-ink-tertiary shrink-0" />
            <p className="text-[12.5px] text-ink-tertiary">
              Nothing here yet — share a PDF and it appears in this group. Files live in{' '}
              <code className="text-[11px] bg-[rgba(0,59,70,0.05)] rounded px-1.5 py-0.5">
                public/resources/sales/
              </code>
            </p>
          </div>
        )}
      </section>

      {/* ── Videos — all 10 rendered, module 11 honestly pending ── */}
      <section>
        <h3 className="font-serif text-2xl font-normal text-ink-primary">Video series</h3>
        <p className="text-[13px] text-ink-tertiary mt-1 mb-4 max-w-[640px]">
          Animated module explainers with narrated Key Notes recaps and English subtitles —
          playable on each module page.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {videos.map((r) => (
            <VideoCard key={r.id} r={r} />
          ))}
        </div>
      </section>

      {/* ── FAQ bank ── */}
      <section>
        <h3 className="font-serif text-2xl font-normal text-ink-primary">FAQ bank</h3>
        <p className="text-[13px] text-ink-tertiary mt-1 mb-4 max-w-[640px]">
          Every recurring customer question, answered from the vetted content.
        </p>
        <Link
          href="/academy/sales/faq"
          className={cn(CARD, 'group flex items-start gap-3.5 p-4 max-w-[560px] hover:shadow-card transition-shadow')}
        >
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-accent-copper/12 border border-accent-copper/40">
            <HelpCircle size={18} className="text-accent-copper" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-semibold text-ink-primary">Sales FAQ — 27 questions with interactive visuals</span>
            <span className="block text-[12px] text-ink-tertiary mt-1 leading-relaxed">
              Flowcharts, decision trees, comparisons and charts — objections, pricing, process,
              locations. Unresolved conflicts flagged.
            </span>
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-accent-copper group-hover:underline">
              Open the FAQ →
            </span>
          </span>
        </Link>
      </section>
    </div>
  )
}
