'use client'

/**
 * Responsive grid of category cards — one card per option/type/list item.
 * Pure presentation; titles and bodies come from the FAQ config.
 */

export default function CategoryCards({
  cards,
}: {
  cards: { title: string; body: string }[]
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream px-4 py-3"
        >
          <p className="text-[13px] font-semibold text-ink-primary">{card.title}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-secondary">{card.body}</p>
        </div>
      ))}
    </div>
  )
}
