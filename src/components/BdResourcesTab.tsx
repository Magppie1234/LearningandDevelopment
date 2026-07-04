'use client'

import { FileText, Download, PlayCircle, Clock, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BD_RESOURCES, type BdResource } from '@/data/bd-resources'
import BdDmTemplates from '@/components/BdDmTemplates'

/**
 * BD academy Resources tab — real files instead of the seed placeholder
 * cards. Three separated groups: generated reading packs (downloadable PDFs,
 * one per module), team-provided documents, and the video series (kept
 * separate with honest production status).
 */

const CARD = 'rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream'

function PackCard({ r }: { r: BdResource }) {
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

export default function BdResourcesTab() {
  const reading = BD_RESOURCES.filter((r) => r.group === 'reading')
  const provided = BD_RESOURCES.filter((r) => r.group === 'provided')
  const videos = BD_RESOURCES.filter((r) => r.group === 'video')

  return (
    <div className="space-y-8">
      {/* ── Reading packs ── */}
      <section>
        <h3 className="font-serif text-2xl font-normal text-ink-primary">Reading packs</h3>
        <p className="text-[13px] text-ink-tertiary mt-1 mb-4 max-w-[640px]">
          One PDF per module — the module reading, the verbatim source sections from the master
          training document, and the video narration script. Built for offline reading and revision.
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
                public/resources/bd/
              </code>
            </p>
          </div>
        )}
      </section>

      {/* ── DM templates (Module D, Section 6) — copyable reply cards ── */}
      <BdDmTemplates />

      {/* ── Videos — kept separate ── */}
      <section>
        <h3 className="font-serif text-2xl font-normal text-ink-primary">Videos</h3>
        <p className="text-[13px] text-ink-tertiary mt-1 mb-4 max-w-[640px]">
          The module video series, tracked separately from reading material.
        </p>
        {videos.map((r) => (
          <div key={r.id} className={cn(CARD, 'flex items-start gap-3.5 p-4 max-w-[560px]')}>
            <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-accent-silver/20 border border-accent-silver/50">
              <PlayCircle size={18} className="text-ink-secondary" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold text-ink-primary">{r.title}</p>
              <p className="text-[12px] text-ink-tertiary mt-1 leading-relaxed">{r.description}</p>
              {r.status && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium rounded-full px-2.5 py-1"
                   style={{ backgroundColor: 'var(--status-risk-bg)', color: 'var(--status-risk-fg)' }}>
                  <Clock size={11} /> {r.status}
                </p>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
