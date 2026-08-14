'use client'

/**
 * Module completion badge — a shield/medallion marker for a profile or
 * dashboard, showing the CERTIFIED score.
 *
 * ONE REWARD, TWO PRESENTATIONS. The schema has no badge concept: the only
 * reward table is `certifications`, and it carries level/status/credential_id
 * with no score column and no badge sibling. So this is not a second, lesser
 * award earned separately — it is the same certified result as the printable
 * certificate, rendered small enough to sit on a profile. Building them as two
 * different achievements would have invented a distinction the data does not
 * make.
 *
 * The score shown is `certifiedScore` — the first passing attempt, locked.
 * Never `bestScore`, and never a live recount: a learner who retakes and does
 * better still shows the score they were certified at. That is the rule this
 * badge exists to display, so reading the wrong field here would silently
 * defeat it.
 *
 * Palette is Magppie's own gold/cream, not the navy-and-gold of the reference
 * template — the shape is borrowed, the colours are the brand's.
 */

const GOLD_DEEP = '#7E6318'
const GOLD = '#B08D3F'
const GOLD_LIGHT = '#E3C275'
const CREAM = '#FCFAF7'
const INK = '#2A2320'

export default function CompletionBadge({
  moduleName,
  certifiedScore,
  certifiedTotal,
  size = 128,
}: {
  moduleName: string
  /** The locked first-passing score. Null means not yet certified. */
  certifiedScore: number | null
  certifiedTotal: number | null
  size?: number
}) {
  // An uncertified module has no badge to show. Rendering an empty shield
  // would read as a reward that has been earned and lost.
  if (certifiedScore == null || certifiedTotal == null || certifiedTotal === 0) return null

  const pct = Math.round((certifiedScore / certifiedTotal) * 100)

  return (
    <figure className="inline-flex flex-col items-center gap-2" style={{ width: size }}>
      <svg
        width={size}
        height={size * 1.18}
        viewBox="0 0 100 118"
        role="img"
        aria-label={`${moduleName} completed, certified score ${certifiedScore} of ${certifiedTotal}`}
      >
        <defs>
          <linearGradient id="cb-shield" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={GOLD_LIGHT} />
            <stop offset="0.55" stopColor={GOLD} />
            <stop offset="1" stopColor={GOLD_DEEP} />
          </linearGradient>
          <linearGradient id="cb-ribbon" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={GOLD_DEEP} />
            <stop offset="1" stopColor={GOLD} />
          </linearGradient>
        </defs>

        {/* Ribbon tails, behind the shield */}
        <path d="M30 78 L22 112 L38 104 L46 116 L50 84 Z" fill="url(#cb-ribbon)" opacity="0.9" />
        <path d="M70 78 L78 112 L62 104 L54 116 L50 84 Z" fill="url(#cb-ribbon)" opacity="0.75" />

        {/* Shield */}
        <path
          d="M50 4 L88 16 V52 C88 74 71 88 50 96 C29 88 12 74 12 52 V16 Z"
          fill="url(#cb-shield)"
        />
        <path
          d="M50 11 L81 21 V52 C81 70 67 82 50 89 C33 82 19 70 19 52 V21 Z"
          fill={CREAM}
        />

        <text
          x="50"
          y="40"
          textAnchor="middle"
          fontSize="9"
          letterSpacing="1.6"
          fill={GOLD_DEEP}
          fontWeight="600"
        >
          CERTIFIED
        </text>
        <text x="50" y="63" textAnchor="middle" fontSize="21" fill={INK} fontWeight="700">
          {pct}%
        </text>
        <text x="50" y="76" textAnchor="middle" fontSize="8" fill={INK} opacity="0.65">
          {certifiedScore}/{certifiedTotal}
        </text>
      </svg>

      <figcaption className="text-center">
        <p className="text-[11px] font-semibold leading-tight text-ink-primary">{moduleName}</p>
        <p className="mt-0.5 text-[10px] text-ink-tertiary">Certified score — locked</p>
      </figcaption>
    </figure>
  )
}
