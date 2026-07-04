'use client'

import { useState } from 'react'
import { Copy, Check, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Module D — Instagram / text DM templates (source: Section 6 of the master
 * training document). Copyable "template cards" for BD reps. Every template is
 * VERBATIM per the compliance rule — locked copy, no paraphrasing, exact
 * pricing figures (Rs. 8,400–10,800/sq.ft.). Placeholders like [Name Ji] and
 * [your city] are the source's own and are left intact for the rep to fill.
 */

interface DmTemplate {
  id: string
  label: string
  when: string
  body: string
}

const DM_TEMPLATES: DmTemplate[] = [
  {
    id: 'price-inquiry',
    label: 'Price inquiry',
    when: 'Customer asks about pricing',
    body: 'Hey [Name Ji], Thank you for reaching out! The per square feet price for Wellness Kitchen ranges from Rs. 8,400 to Rs. 10,800 based on the finish you choose. To give a rough estimate, a 10x10 kitchen would start from Rs. 10 lakh. Please share your contact details and our wellness consultants can reach out to you!',
  },
  {
    id: 'general-interest',
    label: 'General interest',
    when: 'Customer is exploring / first touch',
    body: 'Hey [Name Ji], Thank you for reaching out. At Magppie Wellness Kitchens, we make kitchens fully from our patented SilverStone material, which makes it: Termite-safe, No fungus or moisture, Formaldehyde-safe, Cancer-safe, Bacteria-safe. Please share your contact details and our wellness consultants can reach out to you!',
  },
  {
    id: 'serviceability',
    label: 'Serviceability check',
    when: 'Customer asks if you serve their city',
    body: 'Hey, Thank you for reaching out! Yes! We provide our services Pan India and also in [your city]. Please share your contact details and our wellness consultants can reach out to you.',
  },
  {
    id: 'follow-up',
    label: 'Follow-up after call',
    when: 'After a phone conversation',
    body: 'Hi [Name]! It was wonderful speaking with you about your Wellness Kitchen. As discussed, please share your layout here and our team will prepare a customised estimate for you. — Pooja, Magppie Wellness Kitchens',
  },
  {
    id: 'sample-video',
    label: 'Sample / video share',
    when: 'Sending proof / a sample offer',
    body: "Hi [Name]! Here's a short video of our SilverStone kitchen in action: [link]. You can also see real customer installations on our Instagram: @magppie. Let me know if you'd like a sample sent to your home!",
  },
]

const CARD = 'rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream'

function TemplateCard({ t }: { t: DmTemplate }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(t.body)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard blocked (e.g. insecure context) — select-all fallback handled by the browser.
    }
  }
  return (
    <div className={cn(CARD, 'flex flex-col p-4')}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-ink-primary">{t.label}</p>
          <p className="text-[11px] text-ink-tertiary mt-0.5">{t.when}</p>
        </div>
        <button
          type="button"
          onClick={copy}
          className={cn(
            'shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors',
            copied
              ? 'text-parchment bg-accent-copper'
              : 'border-[0.5px] border-[rgba(0,59,70,0.16)] text-ink-secondary hover:border-accent-copper hover:text-accent-copper',
          )}
          aria-label={`Copy ${t.label} template`}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-[12.5px] text-ink-secondary leading-relaxed whitespace-pre-line">{t.body}</p>
    </div>
  )
}

export default function BdDmTemplates() {
  return (
    <section>
      <h3 className="font-serif text-2xl font-normal text-ink-primary flex items-center gap-2">
        <Send size={18} className="text-accent-copper" /> Message templates
      </h3>
      <p className="text-[13px] text-ink-tertiary mt-1 mb-4 max-w-[640px]">
        Ready-to-send Instagram &amp; text DM replies — locked wording from the training document.
        Tap <span className="font-medium text-ink-secondary">Copy</span>, then fill the bracketed
        placeholders (name, city, link).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DM_TEMPLATES.map((t) => (
          <TemplateCard key={t.id} t={t} />
        ))}
      </div>
    </section>
  )
}
