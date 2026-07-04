'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PlayCircle, GitBranch, Network, History, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

/**
 * Dashboard media sections (§8 of the consolidated build).
 *
 * Both sections are academy-agnostic: they render whatever the registries
 * below contain. BD is simply the first academy with video + diagram content —
 * when another academy gains videos/diagrams, add entries (or replace the
 * registries with a DB read) without touching the components.
 */

/* ── data shapes + registry ─────────────────────────────────── */

export interface WatchableVideo {
  academySlug: string
  academyLabel: string
  moduleId: string
  title: string
  href: string
  totalMin: number
  /** true once a real playable file exists (BD videos are script-only today) */
  playable: boolean
}

export interface DiagramCard {
  key: string
  label: string
  academyLabel: string
  href: string
  icon: LucideIcon
  /** primary = frequent/interactive (copper) · secondary = reference (silver) */
  tier: 'primary' | 'secondary'
}

/** Videos the portal knows about, in assignment order. None are playable yet
 *  (script-only), so the card renders its real empty state — never blank. */
const VIDEO_REGISTRY: WatchableVideo[] = [
  {
    academySlug: 'business-development',
    academyLabel: 'Business Development',
    moduleId: 'bd-m1',
    title: 'The Magppie Story: 50 Years to Wellness Kitchens',
    href: '/academy/business-development/modules?module=bd-m1',
    totalMin: 3,
    playable: false,
  },
]

const DIAGRAM_REGISTRY: DiagramCard[] = [
  {
    key: 'pitch-flow',
    label: 'The 8-stage pitch flow',
    academyLabel: 'Business Development',
    href: '/academy/business-development/modules?module=bd-m5#module-visual',
    icon: GitBranch,
    tier: 'primary',
  },
  {
    key: 'objection-tree',
    label: 'Objection decision tree',
    academyLabel: 'Business Development',
    href: '/academy/business-development/modules?module=bd-m6#module-visual',
    icon: Network,
    tier: 'primary',
  },
  {
    key: 'company-timeline',
    label: 'Company history timeline',
    academyLabel: 'Business Development',
    href: '/academy/business-development/modules?module=bd-m1#module-visual',
    icon: History,
    tier: 'secondary',
  },
]

/* ── watch-progress (local, demo-mode) ──────────────────────── */

interface WatchProgress {
  moduleId: string
  watchedMin: number
}

function readWatchProgress(): WatchProgress | null {
  try {
    const raw = localStorage.getItem('magppie-video-progress-v1')
    return raw ? (JSON.parse(raw) as WatchProgress) : null
  } catch {
    return null
  }
}

/* ── Continue watching ──────────────────────────────────────── */

export function ContinueWatchingCard() {
  // localStorage is client-only — read after mount to avoid hydration drift.
  const [progress, setProgress] = useState<WatchProgress | null>(null)
  useEffect(() => setProgress(readWatchProgress()), [])

  const inProgress =
    progress && VIDEO_REGISTRY.find((v) => v.playable && v.moduleId === progress.moduleId)
  const firstAssigned = VIDEO_REGISTRY[0]

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="font-serif text-2xl text-ink-primary mb-4">Continue watching</h2>

      <Link
        href={(inProgress ?? firstAssigned).href}
        className="group flex items-center gap-5 rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-4 hover:shadow-card transition-shadow"
      >
        {/* Thumbnail — navy block with copper play until a real frame exists */}
        <div className="relative w-40 sm:w-48 aspect-video shrink-0 rounded-lg overflow-hidden bg-[#062a33] flex items-center justify-center">
          <PlayCircle
            size={34}
            className="text-accent-copper transition-transform group-hover:scale-110"
          />
          {inProgress && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15">
              <div
                className="h-full bg-accent-copper"
                style={{
                  width: `${Math.min(100, (progress!.watchedMin / inProgress.totalMin) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {inProgress ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
                {inProgress.academyLabel}
              </p>
              <p className="mt-1 text-[15px] font-semibold text-ink-primary truncate">
                {inProgress.title}
              </p>
              <p className="mt-1 text-[12.5px] text-ink-secondary">
                {progress!.watchedMin} of {inProgress.totalMin} min watched — resume where you
                left off
              </p>
            </>
          ) : (
            // Real empty state (§8): nothing in progress → point at the first
            // assigned module, never blank space.
            <>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
                Nothing in progress yet
              </p>
              <p className="mt-1 text-[15px] font-semibold text-ink-primary truncate">
                Start with “{firstAssigned.title}”
              </p>
              <p className="mt-1 text-[12.5px] text-ink-secondary">
                Module 1 of your {firstAssigned.academyLabel} academy — narration available now,
                video coming soon.
              </p>
            </>
          )}
        </div>

        <ArrowRight
          size={18}
          className="shrink-0 text-ink-tertiary group-hover:text-accent-copper group-hover:translate-x-0.5 transition-all"
        />
      </Link>
    </motion.section>
  )
}

/* ── Explore visually ───────────────────────────────────────── */

export function ExploreVisuallyStrip() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="font-serif text-2xl text-ink-primary mb-4">Explore visually</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DIAGRAM_REGISTRY.map((d) => (
          <Link
            key={d.key}
            href={d.href}
            className="group rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-4 hover:shadow-card transition-shadow"
          >
            <span
              className={cn(
                'inline-flex w-10 h-10 rounded-xl items-center justify-center',
                d.tier === 'primary'
                  ? 'bg-accent-copper/12 text-accent-copper'
                  : 'bg-accent-silver/20 text-accent-silver',
              )}
            >
              <d.icon size={20} />
            </span>
            <p className="mt-3 text-[14px] font-semibold text-ink-primary group-hover:text-accent-copper transition-colors">
              {d.label}
            </p>
            <p className="mt-0.5 text-[12px] text-ink-tertiary">{d.academyLabel}</p>
          </Link>
        ))}
      </div>
    </motion.section>
  )
}
